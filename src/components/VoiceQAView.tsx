import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Compass,
  Headphones,
  Loader2,
  Mic,
  Pause,
  Play,
  Sliders,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import { ALL_MODULES } from '../data/seedData.ts';
import {
  PRONUNCIATION_DICTIONARY,
  type PronunciationEntry,
} from '../data/pronunciationDictionary.ts';
import {
  ANALOGY_ABC_VOICE_SAMPLES,
  getModuleSpokenSegments,
  type LessonTabId,
  type SpokenSegment,
} from '../data/spokenScripts.ts';
import {
  TTS_PROVIDER_EVALUATIONS,
  VOICE_PERSONAS,
  loadUserVoicePreferences,
  saveUserVoicePreferences,
  type VoicePersonaId,
} from '../data/voiceConfig.ts';
import { soundFX } from '../utils/soundEffects.ts';
import {
  speakQuickPassage,
  stopAllVoicePlayback,
} from '../utils/voiceEngineClient.ts';

interface VoiceQAViewProps {
  initialModuleId?: string;
  onClose: () => void;
  onPersonaChanged?: (personaId: VoicePersonaId) => void;
}

type QACheckKey =
  | 'naturalPace'
  | 'correctPronunciation'
  | 'goodPauses'
  | 'rightEmphasis'
  | 'noClipping';

const QA_CRITERIA: { key: QACheckKey; label: string; detail: string }[] = [
  {
    key: 'naturalPace',
    label: 'Natural Pace',
    detail: '8–16 words/sentence, ~92–98% rate, no rushed delivery',
  },
  {
    key: 'correctPronunciation',
    label: 'Correct Pronunciation',
    detail: 'Davao Oriental landmarks & academic terms spoken accurately',
  },
  {
    key: 'goodPauses',
    label: 'Believable Pauses',
    detail: '300ms after commas, 550ms between ideas, 800ms before reveals',
  },
  {
    key: 'rightEmphasis',
    label: 'Right Emphasis',
    detail: 'Key relationship words stressed naturally without monotone',
  },
  {
    key: 'noClipping',
    label: 'No Clipping',
    detail: 'Gentle 120ms fade-in/out; clean start and end',
  },
];

export const VoiceQAView: React.FC<VoiceQAViewProps> = ({
  initialModuleId = 'g7-q1-m1',
  onClose,
  onPersonaChanged,
}) => {
  const [studioTab, setStudioTab] = useState<'abc_samples' | 'segment_qa' | 'lexicon_providers'>(
    'abc_samples'
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId);
  const [selectedLessonTab, setSelectedLessonTab] = useState<LessonTabId>('concepts');
  const [activePersonaId, setActivePersonaId] = useState<VoicePersonaId>(
    () => loadUserVoicePreferences().personaId
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedSsmlId, setExpandedSsmlId] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<{
    azureConfigured: boolean;
    geminiConfigured: boolean;
    elevenLabsConfigured: boolean;
    cachedSegmentsCount: number;
  } | null>(null);

  // Per-segment QA checklist state
  const [qaChecks, setQaChecks] = useState<Record<string, Record<QACheckKey, boolean>>>(() => {
    try {
      const saved = localStorage.getItem('lingoquest_voice_qa_checks_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetch('/api/tts/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setServerStatus(data);
      })
      .catch(() => {});

    return () => {
      stopAllVoicePlayback();
    };
  }, []);

  const selectedModule =
    ALL_MODULES.find((m) => m.id === selectedModuleId) || ALL_MODULES[0];
  const currentSegments = getModuleSpokenSegments(selectedModule, selectedLessonTab);

  const handleSelectDefaultPersona = (personaId: VoicePersonaId) => {
    soundFX.playClick();
    setActivePersonaId(personaId);
    const prefs = loadUserVoicePreferences();
    saveUserVoicePreferences({ ...prefs, personaId });
    onPersonaChanged?.(personaId);
  };

  const handlePlaySampleOrSegment = (params: {
    id: string;
    spokenText: string;
    displayText: string;
    personaId: VoicePersonaId;
  }) => {
    soundFX.playClick();
    if (playingId === params.id) {
      stopAllVoicePlayback();
      setPlayingId(null);
      return;
    }

    setPlayingId(params.id);
    void speakQuickPassage({
      segmentId: params.id,
      spokenText: params.spokenText,
      displayText: params.displayText,
      personaId: params.personaId,
      prosodyRole: 'intro',
      onStart: () => setPlayingId(params.id),
      onEnd: () => {
        setPlayingId((prev) => (prev === params.id ? null : prev));
        // Refresh cached segment count
        fetch('/api/tts/status')
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d) setServerStatus(d);
          })
          .catch(() => {});
      },
    });
  };

  const handleToggleQaCriterion = (segmentId: string, criterion: QACheckKey) => {
    soundFX.playClick();
    setQaChecks((prev) => {
      const currentSegChecks = prev[segmentId] || {
        naturalPace: true,
        correctPronunciation: true,
        goodPauses: true,
        rightEmphasis: true,
        noClipping: true,
      };
      const updated = {
        ...prev,
        [segmentId]: {
          ...currentSegChecks,
          [criterion]: !currentSegChecks[criterion],
        },
      };
      try {
        localStorage.setItem('lingoquest_voice_qa_checks_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleApproveAllCriteriaForSegment = (segmentId: string) => {
    soundFX.playPass();
    setQaChecks((prev) => {
      const updated = {
        ...prev,
        [segmentId]: {
          naturalPace: true,
          correctPronunciation: true,
          goodPauses: true,
          rightEmphasis: true,
          noClipping: true,
        },
      };
      try {
        localStorage.setItem('lingoquest_voice_qa_checks_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="LingoQuest Voice Direction, 3-Voice A/B/C Comparison & QA Studio"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Navy Header */}
        <div className="bg-gradient-to-r from-[#0A192F] via-[#0F294A] to-[#1E3E62] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-sky-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  Instructional Voice Direction & QA Studio
                </span>
                {serverStatus && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {serverStatus.cachedSegmentsCount} Segments Cached
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Ate & Kuya Lingo Voice Engine · Davao Oriental DepEd MELC Edition
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFX.playClick();
              stopAllVoicePlayback();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Close Studio</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              {
                id: 'abc_samples',
                label: '1. 3-Voice A/B/C Comparison (Analogy Sample)',
                icon: Mic,
              },
              {
                id: 'segment_qa',
                label: '2. All-Module Segment Player & QA Checklist',
                icon: Sliders,
              },
              {
                id: 'lexicon_providers',
                label: '3. Davao Oriental Pronunciation & Cost Report',
                icon: Compass,
              },
            ].map((t) => {
              const Icon = t.icon;
              const active = studioTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    stopAllVoicePlayback();
                    setPlayingId(null);
                    setStudioTab(t.id as any);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
                    active
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Active Tutor:{' '}
            <strong className="text-sky-800">
              {VOICE_PERSONAS[activePersonaId]?.displayName}
            </strong>
          </div>
        </div>

        {/* Scrollable Studio Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* ================================================================
              TAB 1: 3-VOICE A/B/C COMPARISON (ANALOGY CONCEPTS TAB)
             ================================================================ */}
          {studioTab === 'abc_samples' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm text-sky-950 space-y-1">
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>
                    Reference Sample Audition: Grade 7 Analogy Module ("Concepts & Rules" Tab)
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Listen to all three candidate voice personas below on the rewritten spoken-style Analogy script. Notice how symbols like{' '}
                  <code className="px-1.5 py-0.5 rounded bg-white border border-sky-200 font-mono text-xs">
                    Night : Day :: Happy : Sad
                  </code>{' '}
                  are spoken naturally as{' '}
                  <em>“Night is to Day, as Happy is to Sad”</em> with conversational pauses before the reveal.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {ANALOGY_ABC_VOICE_SAMPLES.map((sample) => {
                  const persona = VOICE_PERSONAS[sample.personaId];
                  const isSelected = activePersonaId === sample.personaId;
                  const samplePlayId = `abc-${sample.personaId}`;
                  const isPlayingThis = playingId === samplePlayId;
                  const isSsmlOpen = expandedSsmlId === samplePlayId;

                  return (
                    <div
                      key={sample.personaId}
                      className={`rounded-2xl border p-4 flex flex-col justify-between space-y-4 transition ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-500/20'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            {sample.badge}
                          </span>
                          {isSelected && (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active Default</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">{sample.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sample.subtitle}
                        </p>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                            On-Screen displayText:
                          </div>
                          <p className="text-slate-800">{sample.displayText}</p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1 text-xs">
                          <div className="text-[10px] font-mono uppercase text-emerald-800 font-bold">
                            Ear-Friendly spokenText:
                          </div>
                          <p className="text-emerald-950 font-medium leading-relaxed">
                            “{sample.spokenText}”
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSsmlId(isSsmlOpen ? null : samplePlayId)
                          }
                          className="text-[11px] font-semibold text-sky-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>{isSsmlOpen ? 'Hide SSML Prosody' : 'View SSML Prosody & Breaks'}</span>
                        </button>

                        {isSsmlOpen && (
                          <pre className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap">
                            {sample.ssmlPreview}
                          </pre>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() =>
                            handlePlaySampleOrSegment({
                              id: samplePlayId,
                              spokenText: sample.spokenText,
                              displayText: sample.displayText,
                              personaId: sample.personaId,
                            })
                          }
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition ${
                            isPlayingThis
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isPlayingThis ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>Stop Sample Playback</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Audition {persona.displayName}</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectDefaultPersona(sample.personaId)}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs border cursor-pointer transition ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white hover:bg-sky-50 text-sky-800 border-sky-300'
                          }`}
                        >
                          {isSelected ? '✓ Selected as Default Tutor' : 'Use This Voice for All Modules'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 2: ALL-MODULE SEGMENT AUDITION & 5-POINT QA CHECKLIST
             ================================================================ */}
          {studioTab === 'segment_qa' && (
            <div className="space-y-5">
              {/* Module & Lesson Tab Filters */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Module:</label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => {
                      soundFX.playClick();
                      stopAllVoicePlayback();
                      setPlayingId(null);
                      setSelectedModuleId(e.target.value);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-900 cursor-pointer"
                  >
                    {ALL_MODULES.map((m) => (
                      <option key={m.id} value={m.id}>
                        G{m.gradeLevel} Q{m.quarter} M{m.moduleNumber} · {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      { id: 'concepts', label: '1. Concepts' },
                      { id: 'examples', label: '2. Guided Analysis' },
                      { id: 'tips', label: '3. Pitfalls' },
                      { id: 'cultural', label: '4. Davao Oriental' },
                      { id: 'vocabulary', label: '5. Vocabulary' },
                      { id: 'checklist', label: '6. Self-Check' },
                      { id: 'cheatsheet', label: '7. Cheatsheet' },
                    ] as { id: LessonTabId; label: string }[]
                  ).map((tb) => (
                    <button
                      key={tb.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        stopAllVoicePlayback();
                        setPlayingId(null);
                        setSelectedLessonTab(tb.id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        selectedLessonTab === tb.id
                          ? 'bg-sky-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tb.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Segments List with Play & 5-Point QA Checklist */}
              <div className="space-y-3">
                {currentSegments.map((seg, idx) => {
                  const isPlayingSeg = playingId === seg.id;
                  const segChecks = qaChecks[seg.id] || {
                    naturalPace: true,
                    correctPronunciation: true,
                    goodPauses: true,
                    rightEmphasis: true,
                    noClipping: true,
                  };
                  const passedCount = Object.values(segChecks).filter(Boolean).length;

                  return (
                    <div
                      key={seg.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-xs font-bold">
                            Seg 0{idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {seg.sectionTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            Speaker: {seg.speaker === 'kuya_lingo' ? 'Kuya James' : 'Ate Rosa'} · Role:{' '}
                            {seg.prosodyRole}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-700">
                            QA: {passedCount}/5 ✓
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handlePlaySampleOrSegment({
                                id: seg.id,
                                spokenText: seg.spokenText,
                                displayText: seg.displayText,
                                personaId:
                                  seg.speaker === 'kuya_lingo'
                                    ? 'kuya_james_ph'
                                    : activePersonaId,
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                              isPlayingSeg
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-sky-600 hover:bg-sky-700 text-white'
                            }`}
                          >
                            {isPlayingSeg ? (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                <span>Pause</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Play Segment</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                            displayText (On-Screen):
                          </div>
                          <p className="text-slate-700">{seg.displayText}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                          <div className="text-[10px] font-mono uppercase text-emerald-800 font-bold mb-1">
                            spokenText (Written to be Heard):
                          </div>
                          <p className="text-emerald-950 font-medium">“{seg.spokenText}”</p>
                        </div>
                      </div>

                      {/* 5-Point QA Checklist Row */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {QA_CRITERIA.map((crit) => {
                            const checked = Boolean(segChecks[crit.key]);
                            return (
                              <button
                                key={crit.key}
                                type="button"
                                onClick={() => handleToggleQaCriterion(seg.id, crit.key)}
                                title={crit.detail}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 cursor-pointer ${
                                  checked
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}
                              >
                                <Check className={`w-3 h-3 ${checked ? 'text-emerald-600' : 'opacity-30'}`} />
                                <span>{crit.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApproveAllCriteriaForSegment(seg.id)}
                          className="text-[11px] font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
                        >
                          Verify All 5 ✓
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 3: DAVAO ORIENTAL PRONUNCIATION LEXICON & PROVIDER EVALUATION
             ================================================================ */}
          {studioTab === 'lexicon_providers' && (
            <div className="space-y-6">
              {/* Davao Oriental & Academic Pronunciation Soundboard */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>
                    Davao Oriental Place Names & Tricky Vocabulary Pronunciation Dictionary ({PRONUNCIATION_DICTIONARY.length} Entries)
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PRONUNCIATION_DICTIONARY.map((entry: PronunciationEntry) => {
                    const lexId = `lex-${entry.term}`;
                    const isPlayingLex = playingId === lexId;
                    return (
                      <div
                        key={entry.term}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-900">{entry.term}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-900 font-bold">
                              /{entry.syllables}/
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-sky-800 mt-1">
                            Respelling: <strong>“{entry.spokenRespelling}”</strong> · IPA: [{entry.ipa}]
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">{entry.note}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handlePlaySampleOrSegment({
                              id: lexId,
                              spokenText: `${entry.term}. Pronounced ${entry.spokenRespelling}. ${entry.note}`,
                              displayText: `${entry.term} (${entry.syllables})`,
                              personaId: activePersonaId,
                            })
                          }
                          className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                            isPlayingLex
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-white hover:bg-sky-50 text-sky-800 border border-slate-200'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isPlayingLex ? 'Speaking...' : `Hear "${entry.term}"`}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Neural TTS Provider Evaluation & Cost Benchmark Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>
                    Neural TTS Engine Evaluation, Philippine English Availability & Full-Curriculum Cost
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {TTS_PROVIDER_EVALUATIONS.map((prov) => (
                    <div
                      key={prov.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{prov.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                          Rank #{prov.recommendedRank}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1">
                        <div>
                          <strong>Voices:</strong> {prov.philippineEnglishVoices}
                        </div>
                        <div>
                          <strong>SSML / Prosody:</strong> {prov.ssmlSupport}
                        </div>
                        <div>
                          <strong>Pricing:</strong> {prov.pricingModel}
                        </div>
                        <div className="text-emerald-800 font-semibold">
                          <strong>Full App Pre-Gen Cost:</strong> {prov.estimatedFullAppCostUSD}
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-sky-900">
                        {prov.verdict}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
