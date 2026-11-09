import 'dotenv/config';
import express from 'express';
import { createServer as createHttpServer } from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { GoogleGenAI, Type } from '@google/genai';
import { createAppSessionToken, requireAuth } from './src/middleware/auth.ts';
import type { AuthRequest } from './src/middleware/auth.ts';
import { VOICE_PERSONAS, type VoicePersonaId } from './src/data/voiceConfig.ts';
import {
  buildSegmentSSML,
  computeWordTimestamps,
  prepareSpokenTextForTTS,
  type ProsodyRole,
} from './src/utils/ssmlBuilder.ts';
import {
  deleteAuditLogsFromDb,
  deleteCustomModuleFromDb,
  deleteSystemFeedbackFromDb,
  deleteUserAccountByUid,
  getAllAuditLogsFromDb,
  getAllCustomModulesFromDb,
  getAllEmailNotificationsFromDb,
  getAllSystemFeedbackFromDb,
  getAllUserAccounts,
  getOrCreateUser,
  getUserAccountByUid,
  insertAuditLogInDb,
  insertEmailNotificationInDb,
  markEmailNotificationReadInDb,
  seedInitialCloudSqlData,
  updateAuditLogsArchiveInDb,
  upsertCustomModuleInDb,
  upsertStudentProgressInDb,
  upsertSystemFeedbackInDb,
  upsertUserAccount,
} from './src/db/users.ts';
import type { EmailNotificationRecord, SystemFeedbackRecord } from './src/types/lingoquest.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function tryDispatchSmtpEmail(notification: EmailNotificationRecord): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost || !smtpUser || !smtpPass) {
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const creds = notification.credentialsSummary || { username: '', email: '' };
    const htmlBody = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: #0B1E36; color: #ffffff; padding: 24px;">
          <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8;">DepEd Schools Division of Davao Oriental · LingoQuest</p>
          <h2 style="margin: 8px 0 0; font-size: 20px;">${notification.headline}</h2>
        </div>
        <div style="padding: 24px; color: #1e293b; background: #ffffff;">
          <p style="font-size: 14px; line-height: 1.6;">${notification.messageBody}</p>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px;">
            <p style="margin: 4px 0;"><strong>Account Holder:</strong> ${notification.recipientName}</p>
            <p style="margin: 4px 0;"><strong>Registered Email:</strong> ${notification.recipientEmail}</p>
            <p style="margin: 4px 0;"><strong>Username:</strong> ${creds.username || 'N/A'}</p>
            ${creds.classCode ? `<p style="margin: 4px 0;"><strong>Class Code:</strong> ${creds.classCode}</p>` : ''}
            ${creds.lrn ? `<p style="margin: 4px 0;"><strong>DepEd LRN:</strong> ${creds.lrn}</p>` : ''}
            ${creds.schoolName ? `<p style="margin: 4px 0;"><strong>School:</strong> ${creds.schoolName}</p>` : ''}
          </div>
          <p style="font-size: 12px; color: #64748b;">You can now sign in on the LingoQuest portal using your registered email or username.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"LingoQuest DepEd Davao Oriental" <${smtpUser}>`,
      to: notification.recipientEmail,
      subject: notification.subject,
      text: `${notification.headline}\n\n${notification.messageBody}\n\nUsername: ${creds.username}\nEmail: ${notification.recipientEmail}\nClass Code: ${creds.classCode || 'N/A'}`,
      html: htmlBody,
    });
  } catch (err) {
    console.warn('Optional SMTP transport warning (email saved in Cloud SQL):', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'LingoQuest DepEd Davao Oriental Server' });
  });

  // Bootstrap session token and initial Cloud SQL seed data
  app.post('/api/auth/session', async (req, res) => {
    try {
      const { uid, email, role } = (req.body || {}) as {
        uid?: string;
        email?: string;
        role?: string;
      };
      const token = createAppSessionToken(
        uid || 'lingoquest-client',
        email || 'client@lingoquest.deped.gov.ph',
        role || 'student'
      );

      await seedInitialCloudSqlData();
      const [users, customModules, auditLogs, emailNotifications, systemFeedback] = await Promise.all([
        getAllUserAccounts(),
        getAllCustomModulesFromDb(),
        getAllAuditLogsFromDb(),
        getAllEmailNotificationsFromDb(),
        getAllSystemFeedbackFromDb(),
      ]);

      res.json({ token, users, customModules, auditLogs, emailNotifications, systemFeedback });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to initialize session';
      console.error('Session initialization error:', error);
      res.status(500).json({ error: message });
    }
  });

  // Google Sign-In synchronization with Cloud SQL
  app.post('/api/auth/google', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || `${uid}@deped.gov.ph`;
      const { displayName, photoUrl } = (req.body || {}) as {
        displayName?: string;
        photoUrl?: string;
      };

      if (!uid) {
        res.status(400).json({ error: 'Missing authenticated user UID.' });
        return;
      }

      const user = await getOrCreateUser(uid, email, displayName, photoUrl);
      res.json({ user });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to synchronize Google account';
      console.error('Google auth sync error:', error);
      res.status(500).json({ error: message });
    }
  });

  // Cloud SQL Users Endpoints
  app.get('/api/users', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const users = await getAllUserAccounts();
      res.json(users);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      console.error('Failed to fetch users:', error);
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/users/:uid', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getUserAccountByUid(String(req.params.uid));
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user';
      console.error('Failed to fetch user:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/users', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { user } = req.body || {};
      if (!user || !user.id) {
        res.status(400).json({ error: 'Valid user account payload is required.' });
        return;
      }
      const saved = await upsertUserAccount(user);
      res.json(saved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save user';
      console.error('Failed to save user:', error);
      res.status(500).json({ error: message });
    }
  });

  app.put('/api/users/:uid', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { user } = req.body || {};
      if (!user || !user.id) {
        res.status(400).json({ error: 'Valid user account payload is required.' });
        return;
      }
      const saved = await upsertUserAccount(user);
      res.json(saved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update user';
      console.error('Failed to update user:', error);
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/users/:uid', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteUserAccountByUid(String(req.params.uid));
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      console.error('Failed to delete user:', error);
      res.status(500).json({ error: message });
    }
  });

  // Cloud SQL Curriculum Modules Endpoints
  app.get('/api/modules', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const modules = await getAllCustomModulesFromDb();
      res.json(modules);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch modules';
      console.error('Failed to fetch modules:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/modules', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { module: moduleData, updatedBy } = req.body || {};
      if (!moduleData || !moduleData.id) {
        res.status(400).json({ error: 'Valid module payload is required.' });
        return;
      }
      const saved = await upsertCustomModuleInDb(moduleData, updatedBy || req.user?.uid);
      res.json(saved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save module';
      console.error('Failed to save module:', error);
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/modules/:moduleId', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteCustomModuleFromDb(String(req.params.moduleId));
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete module';
      console.error('Failed to delete module:', error);
      res.status(500).json({ error: message });
    }
  });

  // Cloud SQL Student Progress Endpoint
  app.post('/api/progress', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { student, moduleId, progress } = req.body || {};
      if (!student || !moduleId || !progress) {
        res.status(400).json({ error: 'Student, moduleId, and progress are required.' });
        return;
      }
      await upsertStudentProgressInDb(student, moduleId, progress);
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to persist student progress';
      console.error('Failed to persist student progress:', error);
      res.status(500).json({ error: message });
    }
  });

  // Cloud SQL Audit Logs Endpoints
  app.get('/api/audit-logs', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const logs = await getAllAuditLogsFromDb();
      res.json(logs);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch audit logs';
      console.error('Failed to fetch audit logs:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/audit-logs', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { log } = req.body || {};
      if (!log || !log.id) {
        res.status(400).json({ error: 'Valid audit log entry is required.' });
        return;
      }
      const saved = await insertAuditLogInDb(log);
      res.json(saved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to record audit log';
      console.error('Failed to record audit log:', error);
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/audit-logs/archive', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { logIds, isArchived, archivedBy } = req.body || {};
      if (!Array.isArray(logIds)) {
        res.status(400).json({ error: 'logIds array is required.' });
        return;
      }
      await updateAuditLogsArchiveInDb(logIds, Boolean(isArchived), archivedBy);
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update audit log archive status';
      console.error('Failed to update audit log archive status:', error);
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/audit-logs', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { logIds } = req.body || {};
      if (!Array.isArray(logIds)) {
        res.status(400).json({ error: 'logIds array is required.' });
        return;
      }
      await deleteAuditLogsFromDb(logIds);
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete audit logs';
      console.error('Failed to delete audit logs:', error);
      res.status(500).json({ error: message });
    }
  });

  // Cloud SQL Email Confirmation & Notification Endpoints
  app.get('/api/email-notifications', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const notifications = await getAllEmailNotificationsFromDb();
      res.json(notifications);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch email notifications';
      console.error('Failed to fetch email notifications:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/email-notifications', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { notification } = req.body || {};
      if (!notification || !notification.id || !notification.recipientEmail) {
        res.status(400).json({ error: 'Valid email notification payload is required.' });
        return;
      }
      const saved = await insertEmailNotificationInDb(notification as EmailNotificationRecord);
      await tryDispatchSmtpEmail(saved);
      res.json(saved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to dispatch email notification';
      console.error('Failed to dispatch email notification:', error);
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/email-notifications/:id/read', requireAuth, async (req: AuthRequest, res) => {
    try {
      await markEmailNotificationReadInDb(String(req.params.id));
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to mark email as read';
      console.error('Failed to mark email as read:', error);
      res.status(500).json({ error: message });
    }
  });

  // Cloud SQL System Feedback, Bug Reports & Feature Requests Endpoints
  app.get('/api/feedback', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const items = await getAllSystemFeedbackFromDb();
      res.json(items);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch system feedback';
      console.error('Failed to fetch system feedback:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/feedback', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { feedback } = req.body || {};
      if (!feedback || !feedback.id || !feedback.subject || !feedback.message) {
        res.status(400).json({ error: 'Valid feedback payload with subject and message is required.' });
        return;
      }
      const saved = await upsertSystemFeedbackInDb(feedback as SystemFeedbackRecord);
      res.json(saved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit feedback';
      console.error('Failed to submit feedback:', error);
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/feedback/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { feedback } = req.body || {};
      if (!feedback || !feedback.id) {
        res.status(400).json({ error: 'Valid feedback update payload is required.' });
        return;
      }
      const saved = await upsertSystemFeedbackInDb(feedback as SystemFeedbackRecord);
      res.json(saved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update feedback status';
      console.error('Failed to update feedback status:', error);
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/feedback/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteSystemFeedbackFromDb(String(req.params.id));
      res.json({ success: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete feedback item';
      console.error('Failed to delete feedback item:', error);
      res.status(500).json({ error: message });
    }
  });

  // AI-Assisted Grammar & Writing Feedback endpoint
  app.post('/api/grammar-feedback', async (req, res) => {
    try {
      const { studentText, promptTitle, gradeLevel, topicType } = req.body as {
        studentText?: string;
        promptTitle?: string;
        gradeLevel?: number;
        topicType?: string;
      };

      if (!studentText || typeof studentText !== 'string' || !studentText.trim()) {
        res.status(400).json({ error: 'Please write at least one sentence before requesting feedback.' });
        return;
      }

      const targetGrade = gradeLevel || 8;
      const contextTitle = promptTitle || 'General Sentence Construction & English Writing';
      const contextTopic = topicType || 'sentence-construction';

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Evaluate the following English writing submission from a Grade ${targetGrade} Filipino public school student in DepEd Davao Oriental.
Writing Activity / Prompt: "${contextTitle}" (Topic Focus: ${contextTopic})
Student's Written Submission:
"""
${studentText.trim()}
"""

Provide encouraging, age-appropriate formative feedback for a Grade ${targetGrade} learner. Identify specific grammar, spelling, or punctuation issues (if any), offer actionable sentence construction and vocabulary improvements, provide a polished suggested revision, and give an encouraging overall clarity comment.`,
        config: {
          systemInstruction:
            'You are a warm, encouraging English Coach for Grade 7–10 students in DepEd Davao Oriental, Philippines. Your goal is to provide constructive, easy-to-understand grammar and sentence construction feedback. Never grade harshly; celebrate strengths while clearly explaining how to improve grammar, parallelism, modal verbs, cohesive devices, and clarity.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallClarityComment: {
                type: Type.STRING,
                description: 'Encouraging, age-appropriate overall feedback on clarity, tone, and message for a Grade 7-10 student.',
              },
              clarityScore: {
                type: Type.INTEGER,
                description: 'Formative self-check clarity score from 60 to 100.',
              },
              correctedVersion: {
                type: Type.STRING,
                description: 'A polished, grammatically sound version of the student text that preserves their original meaning.',
              },
              strengthsHighlighted: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 3 specific positive points about what the student did well.',
              },
              grammarIssues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalPhrase: {
                      type: Type.STRING,
                      description: 'The exact word or phrase from the student text that has an issue.',
                    },
                    suggestion: {
                      type: Type.STRING,
                      description: 'The corrected word or phrase.',
                    },
                    explanation: {
                      type: Type.STRING,
                      description: 'Simple, student-friendly explanation of the grammar or spelling rule.',
                    },
                    ruleCategory: {
                      type: Type.STRING,
                      description: 'Category such as Subject-Verb Agreement, Tense Consistency, Modal Usage, Parallelism, Punctuation, or Spelling.',
                    },
                  },
                  required: ['originalPhrase', 'suggestion', 'explanation', 'ruleCategory'],
                },
                description: 'List of specific grammar, spelling, or mechanics issues found. Empty array if none.',
              },
              constructionSuggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 3 actionable tips to improve sentence construction, transition words, or vocabulary richness.',
              },
            },
            required: [
              'overallClarityComment',
              'clarityScore',
              'correctedVersion',
              'strengthsHighlighted',
              'grammarIssues',
              'constructionSuggestions',
            ],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({ error: 'Received an empty response from the language coach service.' });
        return;
      }

      const parsed = JSON.parse(rawText.trim());
      res.json(parsed);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to generate grammar feedback.';
      console.error('Gemini API error:', message);
      res.status(500).json({ error: message });
    }
  });

  // ==========================================================================
  // Neural Voice Lesson TTS Engine & Content-Hash Audio Cache (/api/tts/*)
  // Priority chain:
  //   1. Pre-generated / cached audio in /public/audio/cache/<sha256>
  //   2. Azure Neural TTS (en-PH-RosaNeural / en-PH-JamesNeural with full SSML)
  //   3. Gemini 3.8 Neural TTS (gemini-3.8-flash-lite-tts with Filipino Ate/Kuya persona style)
  //   4. ElevenLabs Multilingual v2
  //   5. Client-side tuned Web Speech API fallback (never fails silently)
  // ==========================================================================
  const audioCacheDir = path.resolve(__dirname, 'public', 'audio', 'cache');
  try {
    fs.mkdirSync(audioCacheDir, { recursive: true });
  } catch {
    // ignore directory creation warnings
  }
  app.use('/audio', express.static(path.resolve(__dirname, 'public', 'audio')));

  app.get('/api/tts/status', (_req, res) => {
    let cachedFilesCount = 0;
    try {
      if (fs.existsSync(audioCacheDir)) {
        cachedFilesCount = fs
          .readdirSync(audioCacheDir)
          .filter((f) => f.endsWith('.wav') || f.endsWith('.mp3')).length;
      }
    } catch {
      cachedFilesCount = 0;
    }

    res.json({
      azureConfigured: Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      elevenLabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY),
      cachedSegmentsCount: cachedFilesCount,
      cacheDirectory: '/public/audio/cache',
    });
  });

  app.post('/api/tts/synthesize', async (req, res) => {
    try {
      const {
        segmentId = 'seg',
        spokenText = '',
        displayText = '',
        personaId = 'ate_rosa_ph',
        prosodyRole = 'definition',
        keyTerms = [],
      } = (req.body || {}) as {
        segmentId?: string;
        spokenText?: string;
        displayText?: string;
        personaId?: VoicePersonaId;
        prosodyRole?: ProsodyRole;
        keyTerms?: string[];
      };

      if (!spokenText || typeof spokenText !== 'string' || !spokenText.trim()) {
        res.status(400).json({ error: 'spokenText is required for TTS synthesis.' });
        return;
      }

      const persona = VOICE_PERSONAS[personaId] || VOICE_PERSONAS.ate_rosa_ph;
      const preparedSpoken = prepareSpokenTextForTTS(spokenText);
      const ssml = buildSegmentSSML({
        spokenText,
        role: prosodyRole,
        keyTerms,
        personaId: persona.id,
      });

      // Compute deterministic SHA-256 content hash so unchanged text is never regenerated
      const contentHash = crypto
        .createHash('sha256')
        .update(`${persona.id}::${prosodyRole}::${preparedSpoken}`)
        .digest('hex')
        .slice(0, 20);

      const cachedWavPath = path.join(audioCacheDir, `${contentHash}.wav`);
      const cachedMp3Path = path.join(audioCacheDir, `${contentHash}.mp3`);
      const cachedMetaPath = path.join(audioCacheDir, `${contentHash}.json`);

      // 1. Check Content-Hash Disk Cache first
      if (fs.existsSync(cachedMetaPath) && (fs.existsSync(cachedWavPath) || fs.existsSync(cachedMp3Path))) {
        try {
          const meta = JSON.parse(fs.readFileSync(cachedMetaPath, 'utf-8'));
          const ext = fs.existsSync(cachedMp3Path) ? 'mp3' : 'wav';
          res.json({
            cached: true,
            hash: contentHash,
            segmentId,
            provider: meta.provider || 'cache',
            audioUrl: `/audio/cache/${contentHash}.${ext}`,
            durationMs: meta.durationMs,
            timestamps: meta.timestamps || computeWordTimestamps(displayText || spokenText, keyTerms, meta.durationMs),
            ssml,
          });
          return;
        } catch {
          // If metadata is corrupt, regenerate below
        }
      }

      // 2. Try Azure Neural TTS (en-PH-RosaNeural / en-PH-JamesNeural) if configured
      const azureKey = process.env.AZURE_SPEECH_KEY;
      const azureRegion = process.env.AZURE_SPEECH_REGION;
      if (azureKey && azureRegion) {
        try {
          const azureResp = await fetch(
            `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
            {
              method: 'POST',
              headers: {
                'Ocp-Apim-Subscription-Key': azureKey,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
                'User-Agent': 'LingoQuest-DepEd-DavaoOriental',
              },
              body: ssml,
            }
          );

          if (azureResp.ok) {
            const arrayBuf = await azureResp.arrayBuffer();
            const mp3Buffer = Buffer.from(arrayBuf);
            // Approximate duration for 96kbps (12,000 bytes/sec)
            const durationMs = Math.max(800, Math.round((mp3Buffer.length / 12000) * 1000));
            const timestamps = computeWordTimestamps(displayText || spokenText, keyTerms, durationMs);

            fs.writeFileSync(cachedMp3Path, mp3Buffer);
            fs.writeFileSync(
              cachedMetaPath,
              JSON.stringify({
                segmentId,
                hash: contentHash,
                provider: 'azure_neural_en_ph',
                voice: persona.azureVoiceName,
                durationMs,
                timestamps,
                createdAt: new Date().toISOString(),
              })
            );

            res.json({
              cached: false,
              hash: contentHash,
              segmentId,
              provider: 'azure_neural_en_ph',
              audioUrl: `/audio/cache/${contentHash}.mp3`,
              durationMs,
              timestamps,
              ssml,
            });
            return;
          }
        } catch (azureErr) {
          console.warn('Azure Neural TTS fallback to Gemini TTS:', azureErr);
        }
      }

      // 3. Use Server-Side Gemini 3.8 Neural TTS (gemini-3.8-flash-lite-tts)
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = getAiClient();
          const ttsResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: preparedSpoken,
                    speechMetadata: {
                      style: persona.geminiStylePrompt,
                    },
                  } as any,
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: persona.geminiVoiceName,
                  },
                },
              },
            },
          });

          const base64Audio =
            ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            // Unary response from gemini-3.8-flash-lite-tts is a complete 24kHz mono 16-bit WAV file
            const wavBuffer = Buffer.from(base64Audio, 'base64');
            // Exact duration in ms from 24kHz 16-bit mono WAV (48,000 bytes per second after 44-byte RIFF header)
            const pcmBytes = Math.max(0, wavBuffer.length - 44);
            const durationMs = Math.max(600, Math.round((pcmBytes / 48000) * 1000));
            const timestamps = computeWordTimestamps(displayText || spokenText, keyTerms, durationMs);

            fs.writeFileSync(cachedWavPath, wavBuffer);
            fs.writeFileSync(
              cachedMetaPath,
              JSON.stringify({
                segmentId,
                hash: contentHash,
                provider: 'gemini_3_8_neural_tts',
                voice: persona.geminiVoiceName,
                durationMs,
                timestamps,
                createdAt: new Date().toISOString(),
              })
            );

            res.json({
              cached: false,
              hash: contentHash,
              segmentId,
              provider: 'gemini_3_8_neural_tts',
              audioUrl: `/audio/cache/${contentHash}.wav`,
              durationMs,
              timestamps,
              ssml,
            });
            return;
          }
        } catch (geminiErr) {
          console.warn('Gemini 3.8 TTS fallback notice:', geminiErr);
        }
      }

      // 4. Fallback response with computed word timestamps & SSML so client uses tuned speechSynthesis
      const fallbackTimestamps = computeWordTimestamps(displayText || spokenText, keyTerms);
      res.json({
        cached: false,
        hash: contentHash,
        segmentId,
        provider: 'browser_speech_fallback',
        audioUrl: null,
        preparedSpokenText: preparedSpoken,
        timestamps: fallbackTimestamps,
        ssml,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'TTS synthesis error';
      console.error('TTS synthesis error:', message);
      res.status(500).json({ error: message });
    }
  });

  const httpServer = createHttpServer(app);

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { server: httpServer } },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`LingoQuest server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
