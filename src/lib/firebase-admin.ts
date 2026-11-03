import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectId(): string {
  try {
    const configPath = path.resolve(__dirname, '../../firebase-applet-config.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.projectId && parsed.projectId !== 'remixed-project-id') {
      return parsed.projectId;
    }
  } catch {}
  if (process.env.VITE_FIREBASE_PROJECT_ID && !process.env.VITE_FIREBASE_PROJECT_ID.includes('your-')) {
    return process.env.VITE_FIREBASE_PROJECT_ID;
  }
  return 'gen-lang-client-0157552312';
}

if (!getApps().length) {
  initializeApp({
    projectId: resolveProjectId(),
  });
}

export const adminAuth = getAuth();
