import {PictureHuntIllustration} from './PictureHuntIllustration';
import {CrosswordLetters} from './CrosswordLetters';
import {QuizCloze} from './QuizCloze';
import {isQuizAnswerCorrect,formatCrosswordResponse} from '../utils/quizResponses';
import { QuizConceptCard } from './QuizConceptCard';
import { SourceLessonSections } from './SourceLessonSections';
import { getLessonVisualKey } from './RestoredLessonFigures';
import { PilotQuizSceneCue } from './LessonPilotGuide';
import { getLessonPilot } from '../data/curriculum/lessonPilot';
import { discussionHeadings, getLessonDiscussion } from '../data/curriculum/lessonDiscussions';
import { SourceActivity, SourceExcerpt, SourceGraphic } from './SourceContent';
import { useDigitalContent } from '../data/curriculum/digitalContent';
import { createSourceGameSession, getSessionQuestionCount } from '../utils/sourceGameSession';
import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Copy,
  Eye,
  Feather,
  FileText,
  Grid3X3,
  HelpCircle,
  Keyboard,
  Image as ImageIcon,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LogOut,
  Play,
  Puzzle,
  RefreshCw,
  Scale,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import {
  BADGE_DEFINITIONS,
} from '../data/seedData';
import {
  DifficultyLevel,
  Module,
  QuizGameType,
  QuizQuestion,
  getDavaoOrientalIsland,
} from '../types/lingoquest';
import { soundFX } from '../utils/soundEffects';
import { BadgeIcon } from './BadgeIcon';
import { InabelStrip } from './InabelStrip';
import { PictureHuntArtwork } from './PictureHuntArtwork';
import {
  getModuleVisualConfig,
  VISUAL_XP_REWARDS,
  type VisualActivityKey,
} from '../data/moduleVisualConfigs';
import {
  AnimatedCheatsheetInfographic,
  AnimatedStepper,
  DragDropMatch,
  FlipCard,
  HotspotScene,
  InteractiveDiagram,
  MascotReaction,
  PitfallComparisonCards,
  RuleVisualIllustration,
  SelfCheckVisualChallenge,
  VisualErrorBoundary,
  XPToast,
  type XPToastPayload,
} from './visuals/LessonVisuals';
import { stopAllVoicePlayback } from '../utils/voiceEngineClient';
import { supabase } from '../lib/supabase';
import { QUEST_MARKET_ITEMS } from '../data/questMarket';
import { questGame, type QuestBuyResponse, type QuestGradeResponse, type QuestMarketState, type QuestPowerUp, type QuestPurchaseResponse, type QuestQuestionResponse } from '../services/questGameService';

export interface QuizCompletionPayload {
  moduleId: string;
  difficulty: DifficultyLevel;
  gameModeFilter: QuizGameType | 'all';
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  basePointsEarned: number;
}

interface LessonAndQuizViewProps {
  module: Module;
  nextModule: Module | null;
  initialStage?: 'LESSON' | 'QUIZ_SETUP';
  isPersonalization: boolean;
  onBackToMap: () => void;
  onCompleteLesson: (moduleId: string) => void;
  onSubmitQuizResult: (payload: QuizCompletionPayload) => {
    totalPointsAwarded: number;
    newlyUnlockedBadges: string[];
    bridgeNewlyRestored: boolean;
  };
  onAdvanceToNextModule: (nextMod: Module) => void;
  onOpenWritingLabWithPrompt: (module: Module) => void;
  isPreviewMode?: boolean;
  previewRole?: 'teacher' | 'admin' | null;
  onReturnToDashboard?: () => void;
  onBackToStudentDashboard?: () => void;
  completedVisualItems?: string[];
  onAwardVisualXP?: (
    moduleId: string,
    activityKey: VisualActivityKey,
    xpAmount: number,
    label: string
  ) => { newlyAwarded: boolean; unlockedBadgeName?: string };
}

interface QuestionAnswerLog {
  question: QuizQuestion;
  studentAnswer: string;
  isCorrect: boolean;
  timedOut: boolean;
  timeRemaining: number;
}

export const LessonAndQuizView: React.FC<LessonAndQuizViewProps> = ({
  module: sourceModule,
  nextModule,
  initialStage = 'LESSON',
  isPersonalization,
  onBackToMap,
  onCompleteLesson,
  onSubmitQuizResult,
  onAdvanceToNextModule,
  onOpenWritingLabWithPrompt,
  isPreviewMode = false,
  previewRole = null,
  onReturnToDashboard,
  onBackToStudentDashboard,
  completedVisualItems = [],
  onAwardVisualXP,
}) => {
  const sourceContent = useDigitalContent(sourceModule.pdfLesson);
  const module = React.useMemo(() => ({ ...sourceModule, quizQuestions: sourceContent.data?.games || sourceModule.quizQuestions }), [sourceModule, sourceContent.data]);
  const sourceModuleLabel = module.pdfLesson?.sourceLabel || `Module ${module.moduleNumber}`;
  const [sourceReviewMessage, setSourceReviewMessage] = useState('');
  const [stage, setStage] = useState<'LESSON' | 'QUIZ_SETUP' | 'PLAYING_QUIZ' | 'QUIZ_RESULTS'>(
    initialStage
  );

  const [setupPreviewTab, setSetupPreviewTab] = useState<'simulation' | 'answer_keys'>('simulation');
  const [inspectedMode, setInspectedMode] = useState<QuizGameType | 'all'>('all');

  const [warmupSelected, setWarmupSelected] = useState<string>('');
  const [warmupSubmitted, setWarmupSubmitted] = useState<boolean>(false);

  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [gameModeFilter, setGameModeFilter] = useState<QuizGameType | 'all'>('all');

  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [typedInput, setTypedInput] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [questionLocked, setQuestionLocked] = useState<boolean>(false);
  const [answerLogs, setAnswerLogs] = useState<QuestionAnswerLog[]>([]);
  const [serverSessionId, setServerSessionId] = useState<string | null>(null);
  const [questBalance, setQuestBalance] = useState(0);
  const [questInventory, setQuestInventory] = useState<Partial<Record<QuestPowerUp, number>>>({});
  const [questBusy, setQuestBusy] = useState(false);
  const [questMessage, setQuestMessage] = useState('');
  const [showPowerShop, setShowPowerShop] = useState(false);
  const [usedPowerUps, setUsedPowerUps] = useState<QuestPowerUp[]>([]);
  const [removedChoices, setRemovedChoices] = useState<string[]>([]);
  const [purchasedClue, setPurchasedClue] = useState('');
  const [freezeUntilMs, setFreezeUntilMs] = useState(0);
  const [timerRevision, setTimerRevision] = useState(0);
  const useServerGame = Boolean(supabase && !isPreviewMode);

  const [finalOutcome, setFinalOutcome] = useState<{
    score: number;
    total: number;
    percentage: number;
    passed: boolean;
    pointsAwarded: number;
    newlyUnlockedBadges: string[];
    bridgeNewlyRestored: boolean;
  } | null>(null);

  // Exit Quiz Confirmation Modal state for student gamification
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  const [lessonActiveTab, setLessonActiveTab] = useState<
    'concepts' | 'examples' | 'tips' | 'cultural' | 'vocabulary' | 'checklist' | 'cheatsheet'
  >('concepts');
  const [checkedObjectives, setCheckedObjectives] = useState<Record<number, boolean>>({});
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);

  // Visual Layer State: Data Saver (low-bandwidth mode), local completed items, flipped vocab cards, XP toast
  const [dataSaver, setDataSaver] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lingoquest_data_saver') === 'true';
    } catch {
      return false;
    }
  });
  const [localCompletedVisuals, setLocalCompletedVisuals] = useState<string[]>(completedVisualItems);
  const [flippedVocabMap, setFlippedVocabMap] = useState<Record<string, boolean>>({});
  const [xpToast, setXpToast] = useState<XPToastPayload | null>(null);


  const handleToggleDataSaver = () => {
    soundFX.playClick();
    setDataSaver((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lingoquest_data_saver', String(next));
      } catch {}
      return next;
    });
  };

  const triggerVisualActivityComplete = (
    activityKey: VisualActivityKey,
    xpAmount: number,
    label: string
  ) => {
    if (localCompletedVisuals.includes(activityKey)) {
      return; // Prevent XP farming
    }
    setLocalCompletedVisuals((prev) => Array.from(new Set([...prev, activityKey])));
    if (onAwardVisualXP) {
      const res = onAwardVisualXP(module.id, activityKey, xpAmount, label);
      if (res.newlyAwarded) {
        soundFX.playPass();
        setXpToast({
          id: `${module.id}-${activityKey}-${Date.now()}`,
          xp: xpAmount,
          label,
          badgeUnlocked: res.unlockedBadgeName,
        });
      }
    } else {
      soundFX.playPass();
      setXpToast({
        id: `${module.id}-${activityKey}-${Date.now()}`,
        xp: xpAmount,
        label,
      });
    }
  };

  const timerRef = useRef<number | null>(null);
  const submittedQuestionRef = useRef<string | null>(null);
  const activeQuestionIdRef = useRef<string | null>(null);
  const completedSessionRef = useRef(false);
  const currentIslandName = getDavaoOrientalIsland(module.quarter)?.name || module.islandName;

  const handleGoToStudentDashboard = () => {
    soundFX.playClick();
    setShowExitModal(false);
    if (onBackToStudentDashboard) {
      onBackToStudentDashboard();
    } else if (onReturnToDashboard) {
      onReturnToDashboard();
    } else {
      onBackToMap();
    }
  };

  useEffect(() => {
    setStage(initialStage);
    setWarmupSelected('');
    setWarmupSubmitted(false);
    setFinalOutcome(null);
    setLessonActiveTab('concepts');
    setCheckedObjectives({});
    setCopiedNotes(false);
    setShowExitModal(false);
    setLocalCompletedVisuals(completedVisualItems);
    setFlippedVocabMap({});
    setServerSessionId(null);
    setPurchasedClue('');
    setRemovedChoices([]);
    setUsedPowerUps([]);
  }, [module.id, initialStage]);

  useEffect(() => {
    if (!useServerGame) return;
    questGame<QuestMarketState>('market').then(data => {
      setQuestBalance(data.balance);
      setQuestInventory(Object.fromEntries(data.inventory.map(item => [item.kind, item.quantity])));
    }).catch(() => {});
  }, [useServerGame]);

  useEffect(() => {
    if (stage !== 'PLAYING_QUIZ' || questionLocked || activeQuestions.length === 0 || showExitModal) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const deadline=Date.now()+timeLeft*1000+(freezeUntilMs>Date.now()?10000:0);
    timerRef.current=window.setInterval(()=>{
      if (freezeUntilMs>Date.now()) return;
      const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));
      setTimeLeft(remaining);
      if(remaining===0){
        if(timerRef.current)window.clearInterval(timerRef.current);
        timerRef.current=null;
        handleLockQuestionAnswer('',true);
      }
    },250);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [stage, currentQIndex, questionLocked, activeQuestions, showExitModal, freezeUntilMs, timerRevision]);

  const startQuizSession = async (requestedMode: QuizGameType | 'all' = gameModeFilter) => {
    soundFX.playClick();
    stopAllVoicePlayback();
    if (useServerGame) {
      if (questBusy) return;
      setQuestBusy(true);
      try {
        const response = await questGame<QuestQuestionResponse>('start', { moduleId: module.id, mode: requestedMode, difficulty });
        setServerSessionId(response.sessionId);
        setActiveQuestions(Array.from({ length: 10 }, (_, index) => index === 0 ? response.question : null) as QuizQuestion[]);
        setCurrentQIndex(0);
        setTimeLeft(response.question.timeLimitSeconds || 60);
        setGameModeFilter(requestedMode);
        setQuestionLocked(false);
        setAnswerLogs([]);
        setFinalOutcome(null);
        setUsedPowerUps([]);
        setRemovedChoices([]);
        setPurchasedClue('');
        setQuestMessage('');
        setSourceReviewMessage('');
        completedSessionRef.current = false;
        submittedQuestionRef.current = null;
        activeQuestionIdRef.current = response.question.id;
        setStage('PLAYING_QUIZ');
      } catch (error) { setSourceReviewMessage(error instanceof Error ? error.message : 'The question bank is unavailable.'); }
      finally { setQuestBusy(false); }
      return;
    }
    const historyKey = `lingoquest:question-history:${module.id}:${requestedMode}:${difficulty}`;
    let previousIds = new Set<string>();
    try { previousIds = new Set(JSON.parse(localStorage.getItem(historyKey) || '[]') as string[]); } catch { /* private browsing */ }
    const finalPool = createSourceGameSession(module, module.quizQuestions, requestedMode, difficulty, Math.random, previousIds);
    if (!finalPool) {
      setSourceReviewMessage('This module needs at least 10 verified questions for this game and level. The game is unavailable until its question bank is complete.');
      return;
    }
    try { localStorage.setItem(historyKey, JSON.stringify([...previousIds,...finalPool.map(q=>q.id)].slice(-120))); } catch { /* private browsing */ }
    setSourceReviewMessage('');
    submittedQuestionRef.current=null;
    activeQuestionIdRef.current=finalPool[0]?.id||null;
    completedSessionRef.current=false;
    setGameModeFilter(requestedMode);
    setActiveQuestions(finalPool);
    setCurrentQIndex(0);
    setTimeLeft(finalPool[0]?.timeLimitSeconds || 45);
    setTypedInput('');
    setSelectedOption('');
    setQuestionLocked(false);
    setAnswerLogs([]);
    setFinalOutcome(null);
    setStage('PLAYING_QUIZ');
  };

  const buyPowerUp = async (kind: QuestPowerUp) => {
    if (questBusy) return;
    const item=QUEST_MARKET_ITEMS.find(power=>power.kind===kind)!;
    if (questBalance<item.cost) {setQuestMessage('Insufficient Quest Coins');return;}
    if (!window.confirm(`Exchange ${item.cost} Quest Coins for 1 ${item.label}? Purchases are final.`)) return;
    setQuestBusy(true);
    try {
      const bought=await questGame<QuestBuyResponse>('buy',{kind});
      setQuestBalance(bought.balance);
      setQuestInventory(previous=>({...previous,[kind]:bought.quantity}));
      setQuestMessage(`${item.label} added to inventory.`);
    } catch(error) {setQuestMessage(error instanceof Error?error.message:'Purchase failed. Coins were not deducted.');}
    finally {setQuestBusy(false);}
  };

  const activatePowerUp = async (kind: QuestPowerUp) => {
    if (!serverSessionId || questBusy || usedPowerUps.includes(kind)) return;
    if (!(questInventory[kind] || 0)) {setQuestMessage('Buy this power-up in the Quest Market first.');setShowPowerShop(true);return;}
    setQuestBusy(true);
    try {
      const purchase=await questGame<QuestPurchaseResponse>('activate',{sessionId:serverSessionId,kind});
      setQuestInventory(previous=>({...previous,[kind]:Math.max(0,(previous[kind] || 0)-1)}));
      setUsedPowerUps(previous=>[...previous,kind]);
      setQuestMessage('');
      setShowPowerShop(false);
      if (purchase.hint) setPurchasedClue(purchase.hint);
      if (purchase.reminder) setPurchasedClue(purchase.reminder);
      if (purchase.remove) setRemovedChoices(purchase.remove);
      if (kind==='time_freeze') {setFreezeUntilMs(Date.now()+10000);setTimerRevision(value=>value+1);}
      if (kind==='extra_time') {setTimeLeft(value=>value+15);setTimerRevision(value=>value+1);}
      if (purchase.retry) {
        const response=await questGame<QuestQuestionResponse>('current',{sessionId:serverSessionId});
        setActiveQuestions(previous=>previous.map((question,index)=>index===currentQIndex?response.question:question));
        setAnswerLogs(previous=>previous.slice(0,-1));
        setQuestionLocked(false);setSelectedOption('');setTypedInput('');setPurchasedClue('');
        setTimeLeft(response.question.timeLimitSeconds||60);
        submittedQuestionRef.current=null;activeQuestionIdRef.current=response.question.id;
      }
    } catch(error) {setQuestMessage(error instanceof Error?error.message:'Power-up could not be activated.');}
    finally {setQuestBusy(false);}
  };

  const questShopPanel=useServerGame&&showPowerShop&&(
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Quest Market">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-sky-600 bg-white p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-950">Quest Market</h2><button type="button" onClick={()=>setShowPowerShop(false)} aria-label="Close shop" className="rounded-lg p-2 hover:bg-slate-100"><X className="h-4 w-4"/></button></div>
        <p className="text-sm font-semibold text-sky-800">Quest Coins: {questBalance}</p>
        {questMessage&&<p role="status" className="text-sm text-amber-800">{questMessage}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUEST_MARKET_ITEMS.map(power=>{
            const question=activeQuestions[currentQIndex];
            const incompatible=(questionLocked&&power.kind!=='second_chance')
              ||power.kind==='fifty_fifty'&&((question?.options?.length||question?.pictureOptions?.length||0)<4)
              ||power.kind==='second_chance'&&(!questionLocked||answerLogs.at(-1)?.isCorrect)
              ||!serverSessionId;
            return <div key={power.kind} className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-slate-900"><div className="font-bold">{power.label} <span className="float-right text-sky-800">{power.cost} coins</span></div><p className="mt-1 text-xs text-slate-600">Owned: {questInventory[power.kind] || 0}</p><div className="mt-2 flex gap-2"><button type="button" onClick={()=>buyPowerUp(power.kind)} disabled={questBusy||questBalance<power.cost} className="rounded-lg bg-sky-700 px-2 py-1 text-xs font-bold text-white disabled:opacity-45">Buy 1</button><button type="button" onClick={()=>activatePowerUp(power.kind)} disabled={questBusy||usedPowerUps.includes(power.kind)||incompatible||!(questInventory[power.kind] || 0)} className="rounded-lg border border-emerald-700 px-2 py-1 text-xs font-bold text-emerald-900 disabled:opacity-45">Use 1</button></div></div>;
          })}
        </div>
        <p className="text-xs text-slate-600">Buying deducts coins immediately and adds inventory. Using consumes one item. Each type can be activated once per game.</p>
      </div>
    </div>
  );


  const handleLockQuestionAnswer = async (submittedValue: string, timedOut = false) => {
    if (questionLocked || questBusy) return;
    const currentQ = activeQuestions[currentQIndex];
    if (!currentQ || activeQuestionIdRef.current!==currentQ.id || submittedQuestionRef.current===currentQ.id) return;
    submittedQuestionRef.current=currentQ.id;
    let gradedQuestion=currentQ;
    let isCorrect = !timedOut && isQuizAnswerCorrect(currentQ, submittedValue);
    if (serverSessionId) {
      setQuestBusy(true);
      try {
        const grade=await questGame<QuestGradeResponse>('submit',{sessionId:serverSessionId,answer:timedOut?'':submittedValue});
        isCorrect=grade.correct;
        gradedQuestion={...currentQ,answer:grade.answer,explanation:grade.explanation,source:{fileId:module.pdfLesson?.source.fileId||'',pdfSha256:module.pdfLesson?.source.sha256,page:Number(grade.sourcePage)||1,quote:'',answerQuote:'',sourceId:currentQ.id,kind:'pdf-topic-completion'}};
        setActiveQuestions(prev=>prev.map((question,index)=>index===currentQIndex?gradedQuestion:question));
        if (grade.balance!==null) setQuestBalance(grade.balance);
      } catch (error) {
        submittedQuestionRef.current=null;
        setQuestMessage(error instanceof Error ? error.message : 'Answer could not be saved. Retry.');
        setQuestBusy(false);
        return;
      }
      setQuestBusy(false);
    }
    if (isCorrect) {
      soundFX.playCorrect();
    } else {
      soundFX.playIncorrect();
    }

    setQuestionLocked(true);
    const newEntry: QuestionAnswerLog = {
      question: gradedQuestion,
      studentAnswer: timedOut ? '(Time Expired)' : submittedValue.trim() || '(Blank)',
      isCorrect,
      timedOut,
      timeRemaining: timedOut ? 0 : timeLeft,
    };

    setAnswerLogs((prev) => [...prev, newEntry]);
  };

  const handleNextOrFinishQuestion = async () => {
    soundFX.playClick();
    if (questBusy) return;
    if (currentQIndex + 1 < activeQuestions.length) {
      const nextIdx = currentQIndex + 1;
      if (serverSessionId) {
        setQuestBusy(true);
        try {
          const response=await questGame<QuestQuestionResponse>('current',{sessionId:serverSessionId});
          if (response.index!==nextIdx) throw new Error('Game session is out of sync.');
          setActiveQuestions(prev=>prev.map((question,index)=>index===nextIdx?response.question:question));
          activeQuestionIdRef.current=response.question.id;
          setTimeLeft(response.question.timeLimitSeconds||60);
          setPurchasedClue('');setRemovedChoices([]);setQuestMessage('');setFreezeUntilMs(0);
        } catch(error) {setQuestMessage(error instanceof Error?error.message:'Next question could not load.');setQuestBusy(false);return;}
        setQuestBusy(false);
      }
      if (!serverSessionId) activeQuestionIdRef.current=activeQuestions[nextIdx].id;
      setCurrentQIndex(nextIdx);
      if (!serverSessionId) setTimeLeft(activeQuestions[nextIdx].timeLimitSeconds);
      setTypedInput('');
      setSelectedOption('');
      setQuestionLocked(false);
    } else {
      if (completedSessionRef.current || activeQuestions.length !== getSessionQuestionCount(gameModeFilter) || answerLogs.length !== activeQuestions.length) return;
      completedSessionRef.current=true;
      activeQuestionIdRef.current=null;
      const total = activeQuestions.length;
      let score = answerLogs.filter((a) => a.isCorrect).length;
      if (serverSessionId) {
        setQuestBusy(true);
        try {
          const finish=await questGame<{score:number;total:number;balance:number}>('finish',{sessionId:serverSessionId});
          score=finish.score;setQuestBalance(finish.balance);
        } catch(error) {completedSessionRef.current=false;setQuestMessage(error instanceof Error?error.message:'Results could not be saved.');setQuestBusy(false);return;}
        setQuestBusy(false);
      }
      const percentage = Math.round((score / total) * 100);
      const passed = percentage >= module.requiredPassingScore;

      const basePerCorrect =
        difficulty === 'easy' ? 100 : difficulty === 'moderate' ? 150 : 200;
      const speedBonus = answerLogs.reduce(
        (acc, item) => acc + (item.isCorrect ? Math.min(25, Math.floor(item.timeRemaining / 2)) : 0),
        0
      );
      const basePointsEarned = score * basePerCorrect + speedBonus;

      const result = onSubmitQuizResult({
        moduleId: module.id,
        difficulty,
        gameModeFilter,
        score,
        totalQuestions: total,
        percentage,
        passed,
        basePointsEarned,
      });

      if (passed) {
        soundFX.playBridgeRestored();
      }

      setFinalOutcome({
        score,
        total,
        percentage,
        passed,
        pointsAwarded: result.totalPointsAwarded,
        newlyUnlockedBadges: result.newlyUnlockedBadges,
        bridgeNewlyRestored: result.bridgeNewlyRestored,
      });
      setStage('QUIZ_RESULTS');
    }
  };

  const getGameTypeLabel = (type: QuizGameType): { name: string; subtitle: string } => {
    switch (type) {
      case 'typeHunter':
        return {
          name: 'Type Hunter',
          subtitle: 'Spelling & Vocabulary Rapid Typing',
        };
      case 'pictureHunt':
        return {
          name: 'Picture Hunt',
          subtitle: 'Visual Context & Concept Matching',
        };
      case 'missingPiece':
        return {
          name: 'Missing Piece',
          subtitle: 'Sentence Construction & Grammar Fill-in',
        };
      case 'analogyMaster':
        return {
          name: 'Master Quiz',
          subtitle: 'Source-Based Concept and Evidence Completion',
        };
      case 'crosswordGame':
        return {
          name: 'Crossword Game',
          subtitle: 'Source-Based Crossword Clues Across & Down',
        };
      default:
        return {
          name: 'Quiz Quest',
          subtitle: 'Interactive English Knowledge Challenge',
        };
    }
  };

  if (stage === 'LESSON') {
    const { lessonContent } = module;

    const vocabList = lessonContent.vocabularyGlossary || [];
    const mistakesList = lessonContent.commonMistakesAndTips || [];
    const checklistItems = lessonContent.studyChecklist || [];
    const checkedCount = checklistItems.filter((_, idx) => Boolean(checkedObjectives[idx])).length;
    const allChecked = checkedCount === checklistItems.length;

    const handleCopyStudyNotes = () => {
      soundFX.playClick();
      const guide = getLessonDiscussion(module.id);
      const pilot = getLessonPilot(module.id);
      const notes = guide ? [
        guide.topic,
        ...discussionHeadings.map((heading, index) => {
          const credit = index === 2 ? `\n${guide.exampleLabel}` : '';
          return `${heading}${credit}\n${guide.steps[index]}`;
        }),
        ...(pilot ? [pilot.extra] : []),
      ] : (sourceContent.data?.sourceSections || []).flatMap(section => [
        `[${section.title}]`,
        ...section.entries.flatMap(entry => entry.blockIds.map(id => sourceContent.data!.blocks[id])
          .filter(Boolean)
          .map(block => block.text || block.rows?.map(row => row.join(' | ')).join('\n') || block.labels?.map(label => label.text).join(' ') || '')),
      ]);
      const textToCopy = [module.title, ...notes].join('\n\n');

      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          setCopiedNotes(true);
          setTimeout(() => setCopiedNotes(false), 2500);
        });
      }
    };

    return (
      <div className="space-y-6">
        {/* Faculty / Admin Preview Bar */}
        {isPreviewMode && (
          <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] text-white p-4 rounded-2xl border border-sky-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                    {previewRole === 'teacher' ? 'Faculty Preview Mode' : 'Admin Preview Mode'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-sky-200 border border-white/20">
                    Grade {module.gradeLevel} · {sourceModuleLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  Previewing interactive lesson for <strong>{module.title}</strong> ({module.lessonContent.melcCompetency})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onBackToMap();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Island Map</span>
              </button>
              {onReturnToDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onReturnToDashboard();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  <span>{previewRole === 'teacher' ? 'Classroom Portal' : 'Admin Console'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden">
          <InabelStrip
            variant="royal"
            label={`DepEd MELC ${sourceModuleLabel} • ${currentIslandName}`}
            rightText={`Grade ${module.gradeLevel} • Quarter ${module.quarter}`}
          />
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onBackToMap();
                }}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Island Map ({currentIslandName})</span>
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={handleGoToStudentDashboard}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
                <span>Home</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-sky-800">Grade {module.gradeLevel}</span>
              <span>·</span>
              <span>Quarter {module.quarter}</span>
              <span>·</span>
              <span>{sourceModuleLabel}</span>
              <span>·</span>
              <span className="capitalize font-medium text-slate-700">{module.topicType.replace('-', ' ')}</span>
              <span>·</span>
              <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                Pass: {module.requiredPassingScore}%
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
              {module.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Visual XP Mastery Pill */}
            <div
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1.5"
              title="Illustrations and diagrams for this module"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Visuals: {sourceContent.data ? new Set(sourceContent.data.sourceSections?.flatMap(section=>section.entries.flatMap(entry=>entry.blockIds)).map(id => getLessonVisualKey(module.id, id, sourceContent.data!.blocks[id])).filter(Boolean)).size : '…'}</span>
            </div>

            {/* Data Saver Mode Toggle */}
            <button
              type="button"
              onClick={handleToggleDataSaver}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                dataSaver
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600'
              }`}
              title="Toggle Data Saver Mode (pauses autoplay animations and shows static posters until tapped)"
            >
              <span>{dataSaver ? '⚡ Data Saver: ON' : '⚡ Data Saver: OFF'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyStudyNotes}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy formatted lesson summary notes to clipboard"
            >
              {copiedNotes ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copy Notes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                onCompleteLesson(module.id);
                setStage('QUIZ_SETUP');
              }}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-xs"
            >
              <span>Complete & Start Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          </div>
        </div>

        {module.pdfLesson ? <SourceLessonSections key={module.id} module={module} content={sourceContent.data} error={sourceContent.error} retry={sourceContent.retry} dataSaver={dataSaver}/> : <p role="status">Lesson content is currently unavailable for this module.</p>}

        {/* Floating XP Reward & Badge Toast */}
        <XPToast
          toast={xpToast}
          onDismiss={() => setXpToast(null)}
        />

      </div>
    );
  }

  if (stage === 'QUIZ_SETUP') {
    const canStart = !!createSourceGameSession(module,module.quizQuestions,gameModeFilter,difficulty,()=>.5);
    const difficultyConfigs: Array<{
      id: DifficultyLevel;
      label: string;
      timePerQ: number;
      pointsPerQ: number;
      complexityDesc: string;
      borderColor: string;
      activeBg: string;
      badgeText: string;
    }> = [
      {
        id: 'easy',
        label: 'Easy Level',
        timePerQ: 60,
        pointsPerQ: 100,
        complexityDesc: 'Recognition with word choices and source-supported letter grids.',
        borderColor: 'border-emerald-500',
        activeBg: 'bg-emerald-50/70',
        badgeText: '● EASY · 60s / QUESTION',
      },
      {
        id: 'moderate',
        label: 'Medium Level',
        timePerQ: 60,
        pointsPerQ: 150,
        complexityDesc: 'Reduced scaffolding: more alternatives and independent word recall.',
        borderColor: 'border-amber-500',
        activeBg: 'bg-amber-50/70',
        badgeText: '▲ MEDIUM · 60s / QUESTION',
      },
      {
        id: 'hard',
        label: 'Hard Level',
        timePerQ: 90,
        pointsPerQ: 200,
        complexityDesc: 'Two-gap reconstruction and independent recall with no given letters. 90 seconds allows time for longer responses.',
        borderColor: 'border-red-500',
        activeBg: 'bg-red-50/70',
        badgeText: '◆ HARD · 90s / QUESTION',
      },
    ];

    const formatConfigs: Array<{
      id: QuizGameType | 'all';
      title: string;
      desc: string;
      icon: React.ReactNode;
    }> = [
      {
        id: 'all',
        title: 'Full Quest Mix (10 Random Questions)',
        desc: '10 questions at your selected difficulty: 2 random tasks from each of the 5 modes.',
        icon: <Sparkles className="w-4 h-4 text-sky-600" />,
      },
      {
        id: 'analogyMaster',
        title: 'Master Quiz (10 Questions per Level)',
        desc: 'Match each expression to its source excerpt. Each difficulty draws 10 unique tasks.',
        icon: <Scale className="w-4 h-4 text-rose-600" />,
      },
      {
        id: 'missingPiece',
        title: 'Missing Piece Quiz (10 Questions)',
        desc: 'Plays 10 randomized questions for Missing Piece mode (sentence structure, grammatical connectors, and rule terms).',
        icon: <Puzzle className="w-4 h-4 text-purple-600" />,
      },
      {
        id: 'pictureHunt',
        title: 'Picture Hunt Quiz (10 Questions)',
        desc: 'Plays 10 randomized questions for Picture Hunt mode (matching topic-specific visual concept cards).',
        icon: <ImageIcon className="w-4 h-4 text-amber-600" />,
      },
      {
        id: 'crosswordGame',
        title: 'Crossword Game (10 Questions)',
        desc: 'Plays 10 randomized questions for Crossword Game mode (solving across and down letter clues).',
        icon: <Grid3X3 className="w-4 h-4 text-indigo-600" />,
      },
      {
        id: 'typeHunter',
        title: 'Hunter Quiz (Word Hunter · 10 per Level)',
        desc: 'Plays 10 randomized questions for Word Hunter mode (typing target vocabulary and master concepts).',
        icon: <Keyboard className="w-4 h-4 text-emerald-600" />,
      },
    ];

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {useServerGame&&<div className="flex justify-end gap-2 text-sm font-semibold text-sky-900"><span className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">Quest Coins: {questBalance}</span><button type="button" onClick={()=>setShowPowerShop(true)} className="rounded-lg border border-sky-300 px-3 py-2 hover:bg-sky-50">Quest Market</button></div>}
        {questShopPanel}
        {/* Faculty / Admin Preview Bar */}
        {isPreviewMode && (
          <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] text-white p-4 rounded-2xl border border-sky-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                    {previewRole === 'teacher' ? 'Faculty Preview Mode' : 'Admin Preview Mode'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-sky-200 border border-white/20">
                    Grade {module.gradeLevel} · {sourceModuleLabel} Quizzes
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  Previewing quizzes for <strong>{module.title}</strong> · {module.quizQuestions.length} verified questions (10 per session)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onBackToMap();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Island Map</span>
              </button>
              {onReturnToDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onReturnToDashboard();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  <span>{previewRole === 'teacher' ? 'Classroom Portal' : 'Admin Console'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Preview Mode Switcher: Interactive Simulation vs. Question Bank Audit */}
        {isPreviewMode && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSetupPreviewTab('simulation');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                setupPreviewTab === 'simulation'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-4 h-4 text-sky-600" />
              <span>Interactive Quiz Simulation (5 or 15 Items)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSetupPreviewTab('answer_keys');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                setupPreviewTab === 'answer_keys'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Review Verified Questions with Answer Keys</span>
            </button>
          </div>
        )}

        {/* When Audit Answer Keys view is active in preview mode */}
        {isPreviewMode && setupPreviewTab === 'answer_keys' ? (
          <div className="bg-white border-2 border-[#231F20] linocut-card rounded-2xl overflow-hidden space-y-6 animate-fade-in">
            <InabelStrip variant="royal" label="Curriculum Answer Key & Pedagogical Audit" />
            <div className="min-w-0 px-4 sm:px-8 pb-6 sm:pb-8 space-y-6 [overflow-wrap:anywhere]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Curriculum Answer Key & Pedagogical Audit</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-1">
                  Grade {module.gradeLevel} {sourceModuleLabel}: {module.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  DepEd MELC: {module.lessonContent.melcCompetency} · Total Questions: {module.quizQuestions?.length || 0}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setSetupPreviewTab('simulation');
                    startQuizSession();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Simulation Now</span>
                </button>
              </div>
            </div>

            {/* Game Mode Filter for Audit */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(
                [
                  { id: 'all', label: `All Questions (${module.quizQuestions.length})` },
                  { id: 'analogyMaster', label: 'Master Quiz (15)' },
                  { id: 'missingPiece', label: 'Missing Piece (15)' },
                  { id: 'crosswordGame', label: 'Crossword Game (15)' },
                  { id: 'pictureHunt', label: 'Picture Hunt (15)' },
                  { id: 'typeHunter', label: 'Word Hunter (15)' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setInspectedMode(f.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    inspectedMode === f.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {(module.quizQuestions || [])
                .filter((q) => (inspectedMode === 'all' ? true : q.type === inspectedMode))
                .map((q, idx) => {
                  const gameInfo = getGameTypeLabel(q.type);
                  return (
                    <div
                      key={q.id || idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            Q{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {gameInfo.name} ({gameInfo.subtitle})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {q.difficulty}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              soundFX.playClick();
                              setGameModeFilter(q.type);
                              setSetupPreviewTab('simulation');
                              startQuizSession(q.type);
                            }}
                            className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3 text-sky-600" />
                            <span>Test This Mode</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {q.prompt}
                      </div>

                      {q.contextSentence && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                          “{q.contextSentence}”
                        </div>
                      )}

                      {/* Picture Hunt Artwork Preview */}
                      {q.type === 'pictureHunt' && q.pictureOptions && q.pictureOptions.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {q.pictureOptions.map((opt) => {
                            const isCorrectOpt = opt.id === q.answer || opt.label.trim().toLowerCase() === q.answer.trim().toLowerCase();
                            return (
                              <div
                                key={opt.id}
                                className={`p-2 rounded-xl border text-center transition ${
                                  isCorrectOpt
                                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/30'
                                    : 'border-slate-200 bg-white'
                                }`}
                              >
                                <div className="h-28 w-full mb-1 rounded-lg overflow-hidden border border-slate-200">
                                  <>{opt.conceptVisual ? <QuizConceptCard {...opt.conceptVisual} topic={module.title} compact/> : opt.sourceGraphic ? <SourceGraphic block={opt.sourceGraphic}/> : opt.sourceImageUrl ? <img src={opt.sourceImageUrl} alt={opt.caption} className="w-full h-auto object-contain"/> : <PictureHuntArtwork sceneId={opt.sceneId}/>}</>
                                </div>
                                <div className="text-[11px] font-bold text-slate-800 flex items-center justify-center gap-1">
                                  {isCorrectOpt && <Check className="w-3 h-3 text-emerald-600" />}
                                  <span>{opt.label}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">{opt.caption}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Multiple choice options */}
                      {q.options && q.options.length > 0 && q.type !== 'pictureHunt' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrect && (
                                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Word Hunter Target Word */}
                      {q.type === 'typeHunter' && (
                        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs">
                          <span className="text-emerald-900">
                            Target Vocabulary Word: <strong className="font-mono text-sm">{q.answer}</strong> ({q.answer.length} letters)
                          </span>
                          <span className="font-bold text-emerald-700">✓ Type Hunter Answer</span>
                        </div>
                      )}

                      {/* Pedagogical Explanation */}
                      <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-slate-700 space-y-1">
                        <strong className="text-blue-900 block font-bold">Explanation & Rule:</strong>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
            </div>
          </div>
        ) : (
        <div className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden space-y-6">
          <InabelStrip
            variant="royal"
            label={`Quiz Challenge Setup • ${currentIslandName}`}
            rightText={`Passing Mark: ${module.requiredPassingScore}%`}
          />
          <div className="min-w-0 px-4 sm:px-8 pb-6 sm:pb-8 space-y-6 [overflow-wrap:anywhere]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="text-xs text-slate-500">
                {sourceModuleLabel} Quiz Setup · {currentIslandName} · Passing Score:{' '}
                <span className="font-mono font-semibold text-slate-900">
                  {module.requiredPassingScore}%
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display mt-1">
                Start Quiz: {module.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setStage('LESSON');
                }}
                className="px-3.5 py-2 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Go back to the module lesson and study notes"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Back to Module</span>
              </button>
              <button
                type="button"
                onClick={handleGoToStudentDashboard}
                className="px-3.5 py-2 text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Go to Home"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Home</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onBackToMap();
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                title="Return to Island Quests map"
              >
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>Island Map</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              1. Select Difficulty Level (Adjusts Question Complexity & Timer per Question)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {difficultyConfigs.map((cfg) => {
                const isSelected = difficulty === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setDifficulty(cfg.id);
                    }}
                    className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${cfg.borderColor} ${cfg.activeBg}`
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-800">
                        {cfg.badgeText}
                      </div>
                      <div className="text-base font-bold text-slate-900 mt-1">
                        {cfg.label}
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {cfg.complexityDesc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-600">Timer: {cfg.timePerQ}s</span>
                      <span className="font-semibold text-slate-900">
                        +{cfg.pointsPerQ} pts/item
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-3">
              2. Choose Gamified Quiz Mode
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {formatConfigs.map((fmt) => {
                const isSelected = gameModeFilter === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setGameModeFilter(fmt.id);
                    }}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/60 ring-1 ring-sky-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {fmt.icon}
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {fmt.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {fmt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {(!canStart || sourceReviewMessage) && <p role="status">{sourceReviewMessage || 'The bundled question bank is unavailable. Please reload the app.'}</p>}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Score at least <span className="font-mono font-bold text-slate-900">{module.requiredPassingScore}%</span> to restore the bridge for {sourceModuleLabel} and unlock the next destination!
            </div>
            <button
              type="button"
              onClick={() => startQuizSession()}
              disabled={!canStart||questBusy}
              className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <span>Launch Gamified Quiz Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          </div>
        </div>
        )}
      </div>
    );
  }

  if (stage === 'PLAYING_QUIZ') {
    if (activeQuestions.length !== getSessionQuestionCount(gameModeFilter)) return <p role="status">Question bank unavailable. Please return to setup and retry.</p>;
    const currentQ = activeQuestions[currentQIndex];
    if (!currentQ) return null;

    const gameInfo = getGameTypeLabel(currentQ.type);
    const latestLog = questionLocked ? answerLogs[answerLogs.length - 1] : null;
    const timerPercent = Math.max(0, Math.round((timeLeft / currentQ.timeLimitSeconds) * 100));

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {questShopPanel}
        {useServerGame&&<div className="flex flex-wrap items-center justify-end gap-2 text-xs font-bold text-sky-900"><span className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">Quest Coins: {questBalance}</span><button type="button" onClick={()=>setShowPowerShop(true)} className="rounded-lg border border-sky-300 px-3 py-2 hover:bg-sky-50">Quest Market</button></div>}
        {questMessage&&<div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">{questMessage}{questMessage==='Insufficient Quest Coins'&&<button type="button" onClick={()=>setShowPowerShop(true)} className="ml-2 underline">Open shop</button>}</div>}
        {/* Faculty / Admin Preview Bar */}
        {isPreviewMode && (
          <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] text-white p-4 rounded-2xl border border-sky-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                    {previewRole === 'teacher' ? 'Faculty Preview Mode' : 'Admin Preview Mode'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-sky-200 border border-white/20">
                    Simulating Quiz · Question {currentQIndex + 1}/{activeQuestions.length}
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  Testing Grade {module.gradeLevel} {sourceModuleLabel}: {module.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setStage('QUIZ_SETUP');
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Exit Simulation</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onBackToMap();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Island Map</span>
              </button>
            </div>
          </div>
        )}

        {/* Student Active Quiz Navigation & Exit Bar */}
        {!isPreviewMode && (
          <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shrink-0 font-bold shadow">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-300">
                    Active Quiz Challenge
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-sky-200 border border-white/20">
                    Question {currentQIndex + 1} of {activeQuestions.length}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Grade {module.gradeLevel} {sourceModuleLabel}: <span className="font-semibold text-white">{module.title}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowExitModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-200 hover:text-white text-xs font-bold border border-sky-500/30 transition cursor-pointer flex items-center gap-1.5"
                title="Exit quiz and return to Module lesson"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>Back to Module</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowExitModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200 hover:text-white text-xs font-bold border border-indigo-500/30 transition cursor-pointer flex items-center gap-1.5"
                title="Exit quiz and return to Home"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Home</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowExitModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white text-xs font-bold border border-rose-500/30 transition cursor-pointer flex items-center gap-1.5"
                title="Exit quiz session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span>Exit Quiz</span>
              </button>
            </div>
          </div>
        )}

        {/* Educator Answer Inspector Banner */}
        {isPreviewMode && !questionLocked && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-amber-950">
                <strong>Inspector Key:</strong> Correct Answer:{' '}
                <strong className="text-emerald-800 underline font-mono text-sm ml-1">
                  {currentQ.type==='pictureHunt'?currentQ.pictureOptions?.find(p=>p.id===currentQ.answer)?.label:currentQ.answer}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  if (currentQ.type === 'typeHunter' || (currentQ.type === 'crosswordGame' && !currentQ.options?.length)) {
                    setTypedInput(currentQ.answer);
                  } else {
                    setSelectedOption(currentQ.answer);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] transition cursor-pointer"
              >
                Auto-Select Correct
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden">
          <InabelStrip
            variant="amber"
            label={`Active Quiz • ${gameInfo.name}`}
            rightText={`Q${currentQIndex + 1}/${activeQuestions.length} • ${difficulty.toUpperCase()}`}
          />
          <div className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">
                {sourceModuleLabel}: {module.title} ·{' '}
                <span className="uppercase font-mono font-semibold text-slate-800">
                  {difficulty} MODE
                </span>
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{gameInfo.name}</span>
                <span className="text-xs font-normal text-slate-500">
                  — {gameInfo.subtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-500">Question</div>
                <div className="text-sm font-bold font-mono tabular-nums text-slate-900">
                  {currentQIndex + 1} / {activeQuestions.length}
                </div>
              </div>

              <div
                className={`px-3.5 py-2 rounded-lg border flex items-center gap-2 font-mono tabular-nums ${
                  timeLeft <= 7
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : timeLeft <= 15
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold">{timeLeft}s</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setShowExitModal(true);
                }}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Exit Quiz and return to Module or Dashboard"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
            <div
              className={`h-full transition-all duration-300 ${
                timeLeft <= 7
                  ? 'bg-red-500'
                  : timeLeft <= 15
                  ? 'bg-amber-500'
                  : 'bg-sky-600'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
          </div>
        </div>

        <div className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden space-y-6">
          <InabelStrip
            variant="royal"
            label={`Challenge ${currentQIndex + 1} • ${gameInfo.name}`}
          />
          <div className="min-w-0 px-4 sm:px-8 pb-6 sm:pb-8 space-y-6 [overflow-wrap:anywhere]">
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-sky-700">
              CHALLENGE {currentQIndex + 1} · {gameInfo.name.toUpperCase()}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQ.prompt}
            </h2>
            {serverSessionId&&!questionLocked&&<button type="button" disabled={questBusy||usedPowerUps.includes('smart_hint')} onClick={()=>questInventory.smart_hint?activatePowerUp('smart_hint'):setShowPowerShop(true)} className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100 disabled:opacity-50">{questInventory.smart_hint ? 'Use Smart Hint · 1 item' : 'Smart Hint · 30 Quest Coins'}</button>}
            {purchasedClue&&<p role="status" className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-950">{purchasedClue}</p>}
          </div>

          {currentQ.sourceGraphic && <SourceGraphic block={currentQ.sourceGraphic}/>}
          {currentQ.type === 'typeHunter' && (
            <div className="space-y-5">
              {currentQ.contextSentence && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm sm:text-base leading-relaxed text-slate-800 font-medium">
                  <PilotQuizSceneCue moduleId={module.id} />
                  “{currentQ.contextSentence}”
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Target Word Length: {currentQ.answer.length} characters</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Array.from({ length: currentQ.answer.length }).map((_, charIdx) => {
                    const typedChar = typedInput[charIdx] || '';
                    return (
                      <div
                        key={charIdx}
                        className={`w-9 h-11 rounded-lg border-2 flex items-center justify-center font-mono text-base font-bold uppercase ${
                          typedChar
                            ? 'border-sky-600 bg-sky-50 text-sky-950'
                            : 'border-slate-300 bg-slate-50 text-slate-400'
                        }`}
                      >
                        {typedChar || ''}
                      </div>
                    );
                  })}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!questionLocked && typedInput.trim()) {
                      handleLockQuestionAnswer(typedInput);
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    disabled={questionLocked}
                    autoFocus
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder={`Type the missing word or expressions here...`}
                    className="flex-1 px-4 py-3 text-base font-mono rounded-xl border border-slate-300 focus:border-sky-600 focus:outline-none disabled:bg-slate-100"
                  />
                  {!questionLocked && (
                    <button
                      type="submit"
                      disabled={!typedInput.trim()}
                      className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Submit Word
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}

          {currentQ.type === 'pictureHunt' && currentQ.pictureOptions && (
            <div className="picture-hunt-board grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-7">
              <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-emerald-50 p-4 sm:p-5 space-y-4" aria-label="Illustrated lesson clue">
                <span className="inline-flex rounded-full bg-sky-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Study the pictures</span>
                <PictureHuntIllustration term={module.title} topic={module.title} className="w-full h-44 sm:h-52"/>
                <p className="rounded-xl border border-sky-100 bg-white p-4 text-sm leading-relaxed text-slate-800">{currentQ.contextSentence}</p>
              </section>
              <section className="space-y-3" aria-label="Picture answer choices">
                <h3 className="text-sm font-bold text-slate-900">Choose the picture that completes the clue.</h3>
                <div className="grid grid-cols-1 min-[380px]:grid-cols-2 auto-rows-fr gap-3">
                {currentQ.pictureOptions.map((pic,index)=>{
                  if (removedChoices.includes(pic.id)) return null;
                  const selected=selectedOption===pic.id;const correct=pic.id===currentQ.answer;
                  return <button key={pic.id} type="button" disabled={questionLocked||questBusy} aria-pressed={selected} aria-label={`${String.fromCharCode(65+index)}. ${pic.label}`} onClick={()=>{setSelectedOption(pic.id);handleLockQuestionAnswer(pic.id);}}
                    className={`group relative rounded-2xl border-2 p-2.5 text-left transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-sky-400 disabled:cursor-default ${questionLocked?(correct?'border-emerald-500 bg-emerald-50':selected?'border-red-500 bg-red-50':'border-slate-200 opacity-60'):'border-slate-200 bg-white hover:border-sky-500 hover:bg-sky-50'}`}>
                    <span className="absolute left-3 top-3 z-10 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-sky-700 text-xs font-bold text-white shadow-sm">{String.fromCharCode(65+index)}</span>
                    {pic.conceptVisual?<QuizConceptCard {...pic.conceptVisual} topic={module.title}/>:pic.sourceGraphic?<SourceGraphic block={pic.sourceGraphic}/>:pic.sourceImageUrl?<img src={pic.sourceImageUrl} alt={pic.caption} className="h-40 w-full object-contain"/>:<PictureHuntArtwork sceneId={pic.sceneId} className="h-40 w-full"/>}
                    <div className="px-1 pb-1 pt-2 text-center"><span className="text-xs sm:text-sm font-bold text-slate-900">{pic.label}</span>{questionLocked&&correct&&<span className="mt-1 block text-xs font-bold text-emerald-700">✓ MATCH</span>}{pic.caption&&<p className="mt-1 text-xs text-slate-600">{pic.caption}</p>}</div>
                  </button>;
                })}
                </div>
              </section>
            </div>
          )}

          {currentQ.type === 'missingPiece' && (
            <div className="space-y-5">
              {currentQ.contextSentence && (
                <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                  <QuizCloze text={currentQ.contextSentence} response={selectedOption||typedInput}/>
                </div>
              )}

              {currentQ.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options.map((opt) => {
                    if (removedChoices.includes(opt)) return null;
                    const isSelected = selectedOption === opt;
                    const isRight = opt.toLowerCase() === currentQ.answer.toLowerCase();
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={questionLocked||questBusy}
                        onClick={() => {
                          setSelectedOption(opt);
                          handleLockQuestionAnswer(opt);
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left font-medium text-sm transition-all flex items-center justify-between cursor-pointer ${
                          questionLocked
                            ? isRight
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                              : isSelected
                              ? 'border-red-500 bg-red-50 text-red-950'
                              : 'border-slate-200 text-slate-500'
                            : 'border-slate-200 hover:border-sky-500 bg-white text-slate-900'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Puzzle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{opt}</span>
                        </span>
                        {questionLocked && isRight && (
                          <span className="text-xs font-mono font-bold text-emerald-700">
                            ✓ FITS
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {currentQ.type === 'analogyMaster' && (
            <div className="space-y-5">
              {currentQ.analogyPair ? (<div className="p-5 rounded-xl bg-slate-900 text-white space-y-3">
                <div className="text-xs font-mono text-sky-300">
                  Relationship Clue: {currentQ.analogyPair.relationshipType}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-2 text-center">
                  <div className="md:col-span-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
                    <span className="font-bold text-amber-300">
                      {currentQ.analogyPair.firstA}
                    </span>
                    <span className="text-xs text-slate-400 mx-2">is to</span>
                    <span className="font-bold text-white">
                      {currentQ.analogyPair.firstB}
                    </span>
                  </div>
                  <div className="md:col-span-1 font-mono text-xs text-sky-400 font-bold">
                    AS
                  </div>
                  <div className="md:col-span-3 p-3 rounded-lg bg-slate-800 border border-sky-500/50">
                    <span className="font-bold text-amber-300">
                      {currentQ.analogyPair.secondC}
                    </span>
                    <span className="text-xs text-slate-400 mx-2">is to</span>
                    <span className="font-mono font-bold text-sky-300 underline">
                      {selectedOption || '______'}
                    </span>
                  </div>
                </div>
              </div>) : <p className="p-5 rounded-xl bg-slate-900 text-white text-sm leading-relaxed">{currentQ.contextSentence}</p>}

              {currentQ.options && (
                <div className="grid grid-cols-1 auto-rows-fr gap-3">
                  {currentQ.options.map((opt) => {
                    if (removedChoices.includes(opt)) return null;
                    const isSelected = selectedOption === opt;
                    const isRight = opt.toLowerCase() === currentQ.answer.toLowerCase();
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={questionLocked||questBusy}
                        onClick={() => {
                          setSelectedOption(opt);
                          handleLockQuestionAnswer(opt);
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          questionLocked
                            ? isRight
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                              : isSelected
                              ? 'border-red-500 bg-red-50 text-red-950'
                              : 'border-slate-200 text-slate-500'
                            : 'border-slate-200 hover:border-sky-500 bg-white text-slate-900'
                        }`}
                      >
                        <span>{opt}</span>
                        {questionLocked && isRight && (
                          <span className="text-xs font-mono font-bold text-emerald-700">
                            ✓ CORRECT
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {currentQ.type === 'crosswordGame' && (
            <div className="space-y-5">
              {/* Crossword Clue Header Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-[#0A1A2F] text-white border border-indigo-500/40 space-y-4 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 font-mono text-xs font-bold border border-indigo-400/40 flex items-center gap-1.5">
                      <Grid3X3 className="w-3.5 h-3.5" />
                      {currentQ.crosswordClue
                        ? `${currentQ.crosswordClue.clueNumber} ${currentQ.crosswordClue.direction}`
                        : '1 ACROSS'}
                    </span>
                    <span className="text-xs text-slate-300">
                      Length: <strong className="text-amber-300 font-mono">{currentQ.answer.length} characters</strong>
                    </span>
                  </div>
                </div>

                {/* The Crossword Clue text */}
                <div className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
                  “{currentQ.crosswordClue?.cluePrompt || currentQ.contextSentence || currentQ.prompt}”
                </div>

                {/* Visual Crossword Grid Cells */}
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-300/80 mb-2">
                    Crossword Letter Cells:
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <CrosswordLetters key={currentQ.id} question={currentQ} value={typedInput} onChange={setTypedInput} onSubmit={()=>{if(!questionLocked&&typedInput.trim())handleLockQuestionAnswer(typedInput);}} locked={questionLocked}/>
                  </div>
                </div>
              </div>

              {/* Options Selection or Direct Typing */}
              {currentQ.options && currentQ.options.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Select the matching crossword word:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQ.options.map((opt) => {
                      if (removedChoices.includes(opt)) return null;
                      const isSelected = selectedOption === opt || typedInput.toLowerCase() === opt.toLowerCase();
                      const isRight = opt.toLowerCase() === currentQ.answer.toLowerCase();
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={questionLocked||questBusy}
                          onClick={() => {
                            setSelectedOption(opt);
                            setTypedInput(opt);
                            handleLockQuestionAnswer(opt);
                          }}
                          className={`p-3.5 rounded-xl border-2 text-left font-mono font-bold text-sm transition-all flex items-center justify-between cursor-pointer ${
                            questionLocked
                              ? isRight
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                                : isSelected
                                ? 'border-red-500 bg-red-50 text-red-950'
                                : 'border-slate-200 text-slate-400'
                              : isSelected
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-950'
                              : 'border-slate-200 hover:border-indigo-500 bg-white text-slate-900'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Grid3X3 className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span className="uppercase">{opt}</span>
                          </span>
                          {questionLocked && isRight && (
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              ✓ FITS CROSSWORD
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!questionLocked && typedInput.trim()) {
                      handleLockQuestionAnswer(typedInput);
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    disabled={questionLocked}
                    autoFocus
                    value={typedInput}
                    onChange={(e) => setTypedInput(formatCrosswordResponse(currentQ.answer.replace(/[•?]/g,'A'),e.target.value))}
                    placeholder="Type the complete crossword word or phrase..."
                    className="flex-1 px-4 py-3 text-base font-mono rounded-xl border border-slate-300 focus:border-indigo-600 focus:outline-none disabled:bg-slate-100 uppercase"
                  />
                  {!questionLocked && (
                    <button
                      type="submit"
                      disabled={!typedInput.trim()}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-md"
                    >
                      Enter Crossword Word
                    </button>
                  )}
                </form>
              )}
            </div>
          )}

          {questionLocked && latestLog && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                latestLog.isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {latestLog.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct Answer!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>
                        {latestLog.timedOut
                          ? 'Time Expired!'
                          : `Incorrect — Correct Answer: "${currentQ.type==='pictureHunt'?currentQ.pictureOptions?.find(p=>p.id===currentQ.answer)?.label:currentQ.answer}"`}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm opacity-90">{currentQ.explanation}</p>
              </div>

              <button
                type="button"
                onClick={handleNextOrFinishQuestion}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center cursor-pointer"
              >
                <span>
                  {currentQIndex + 1 < activeQuestions.length
                    ? 'Next Question'
                    : 'View Quiz Results'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Exit Quiz Confirmation Modal */}
        {showExitModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Exit Quiz Challenge?
                    </h3>
                    <p className="text-xs text-slate-500">
                      You are taking the {sourceModuleLabel} quiz ({currentQIndex + 1} of {activeQuestions.length}). Where would you like to go?
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Close modal and resume quiz"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Option 1: Back to Module Lesson */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setShowExitModal(false);
                    setStage('LESSON');
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 hover:border-sky-300 transition cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-sky-950 flex items-center justify-between">
                      <span>Back to Module Lesson</span>
                      <ArrowRight className="w-4 h-4 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Return to study notes, examples, vocabulary, and self-checks for {sourceModuleLabel}.
                    </p>
                  </div>
                </button>

                {/* Option 2: Go to Home */}
                <button
                  type="button"
                  onClick={handleGoToStudentDashboard}
                  className="w-full text-left p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 hover:border-indigo-300 transition cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-indigo-950 flex items-center justify-between">
                      <span>Go to Home</span>
                      <ArrowRight className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Exit this quiz session and return to your Home (next learning step and useful shortcuts).
                    </p>
                  </div>
                </button>

                {/* Option 3: Return to Island Map */}
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setShowExitModal(false);
                    onBackToMap();
                  }}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition cursor-pointer flex items-center gap-3.5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900 flex items-center justify-between">
                      <span>Return to Island Map</span>
                      <ArrowRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Explore the Davao Oriental archipelago map and choose another module quest.
                    </p>
                  </div>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Quiz ({timeLeft}s remaining)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (stage === 'QUIZ_RESULTS' && finalOutcome) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Faculty / Admin Preview Bar */}
        {isPreviewMode && (
          <div className="bg-gradient-to-r from-[#0A192F] via-[#0F3460] to-[#1E3E62] text-white p-4 rounded-2xl border border-sky-500/30 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                    {previewRole === 'teacher' ? 'Faculty Preview Mode' : 'Admin Preview Mode'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-sky-200 border border-white/20">
                    Quiz Simulation Outcome
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  Evaluated: <strong>{module.title}</strong> · Score: {finalOutcome.score}/{finalOutcome.total} ({finalOutcome.percentage}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onBackToMap();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Island Map</span>
              </button>
              {onReturnToDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onReturnToDashboard();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  <span>{previewRole === 'teacher' ? 'Classroom Portal' : 'Admin Console'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-white border-2 border-[#231F20] linocut-card rounded-xl overflow-hidden space-y-6">
          <InabelStrip
            variant={finalOutcome.passed ? 'emerald' : 'crimson'}
            label={`${sourceModuleLabel} Quiz Summary • ${difficulty.toUpperCase()} Difficulty`}
            rightText={`${finalOutcome.percentage}% Score`}
          />
          <div className="min-w-0 px-4 sm:px-8 pb-6 sm:pb-8 space-y-6 [overflow-wrap:anywhere]">
          {serverSessionId&&<p className="inline-flex rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-900" role="status">Quest Coins balance: {questBalance}</p>}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="space-y-1.5">
              <div className="text-xs font-mono font-semibold text-slate-500">
                {(sourceModuleLabel).toUpperCase()} QUIZ SUMMARY · {difficulty.toUpperCase()} DIFFICULTY
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                {finalOutcome.passed
                  ? 'Quest Victory! Bridge Restored!'
                  : 'Bridge Still Broken — Keep Practicing!'}
              </h1>
              <p className="text-sm text-slate-600">
                {finalOutcome.passed
                  ? `Congratulations! You scored ${finalOutcome.percentage}% (Required: ${module.requiredPassingScore}%), restoring the bridge for ${module.title}.`
                  : `You scored ${finalOutcome.percentage}%, which is below the ${module.requiredPassingScore}% passing mark required to restore the bridge. Review the feedback below and try again!`}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 shrink-0">
              <div className="text-center px-3 border-r border-slate-200">
                <div className="text-xs text-slate-500">Accuracy</div>
                <div
                  className={`text-2xl font-bold font-mono tabular-nums ${
                    finalOutcome.passed ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {finalOutcome.percentage}%
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  {finalOutcome.score} / {finalOutcome.total} Correct
                </div>
              </div>
              <div className="text-center px-3">
                <div className="text-xs text-slate-500">Points Earned</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-600">
                  +{finalOutcome.pointsAwarded}
                </div>
                <div className="text-[11px] text-slate-500">
                  {finalOutcome.passed ? '✓ PASSED' : '✕ NEEDS RETRY'}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 bg-sky-950 p-5 text-white">
            <div className="flex items-center justify-between text-xs text-sky-200 mb-3">
              <span>
                {isPersonalization
                  ? `Personalization Practice: Grade ${module.gradeLevel} · ${currentIslandName}`
                  : `${currentIslandName} · Bridge from ${sourceModuleLabel}`}
              </span>
              <span className="font-mono font-semibold text-amber-300">
                {finalOutcome.passed ? '✓ BRIDGE RESTORED & NEXT MODULE UNLOCKED' : '🔒 BRIDGE REMAINS BROKEN'}
              </span>
            </div>

            <div className="w-full h-24 rounded-lg overflow-hidden bg-sky-900 flex items-center justify-center">
              {finalOutcome.passed ? (
                <svg
                  viewBox="0 0 500 90"
                  className="w-full h-full animate-bridge-pulse"
                  role="img"
                  aria-label="Restored golden bridge connecting islands"
                >
                  <rect width="500" height="90" fill="#0369A1" />
                  <path d="M0 68 L500 68 L500 90 L0 90 Z" fill="#0284C7" />
                  <path d="M0 45 Q45 45 75 72 L0 72 Z" fill="#16A34A" />
                  <path d="M500 45 Q455 45 425 72 L500 72 Z" fill="#16A34A" />
                  <path
                    d="M65 20 Q250 58 435 20"
                    fill="none"
                    stroke="#FDE047"
                    strokeWidth="3"
                  />
                  <line
                    x1="65"
                    y1="52"
                    x2="435"
                    y2="52"
                    stroke="#F59E0B"
                    strokeWidth="6"
                  />
                  {[95, 135, 175, 215, 255, 295, 335, 375, 410].map((x) => (
                    <g key={x}>
                      <line x1={x} y1="34" x2={x} y2="52" stroke="#FDE047" strokeWidth="1.5" />
                      <rect x={x - 10} y="48" width="20" height="8" rx="2" fill="#FBBF24" />
                    </g>
                  ))}
                  <rect x="58" y="14" width="10" height="48" rx="2" fill="#78350F" />
                  <rect x="432" y="14" width="10" height="48" rx="2" fill="#78350F" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 500 90"
                  className="w-full h-full"
                  role="img"
                  aria-label="Broken bridge awaiting passing score"
                >
                  <rect width="500" height="90" fill="#1E293B" />
                  <path d="M0 68 L500 68 L500 90 L0 90 Z" fill="#0F172A" />
                  <line x1="65" y1="48" x2="185" y2="60" stroke="#94A3B8" strokeWidth="5" />
                  <line x1="315" y1="60" x2="435" y2="48" stroke="#94A3B8" strokeWidth="5" />
                  <text
                    x="250"
                    y="50"
                    textAnchor="middle"
                    fill="#F87171"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    SCORE 75%+ TO RESTORE BRIDGE
                  </text>
                </svg>
              )}
            </div>
          </div>

          {finalOutcome.newlyUnlockedBadges.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Award className="w-4 h-4 text-amber-600" />
                <span>NEW ACHIEVEMENT BADGES UNLOCKED!</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from(new Set(finalOutcome.newlyUnlockedBadges)).map((bId) => {
                  const bDef = BADGE_DEFINITIONS.find((b) => b.id === bId);
                  if (!bDef) return null;
                  return (
                    <div
                      key={`unlocked-badge-${bId}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-amber-200"
                    >
                      <BadgeIcon iconType={bDef.iconType} unlocked={true} className="w-7 h-7 shrink-0" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{bDef.name}</div>
                        <div className="text-xs text-slate-600">{bDef.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 font-display">
              Detailed Question-by-Question Review & Feedback
            </h2>
            <div className="space-y-3">
              {answerLogs.map((log, index) => {
                const isPic = log.question.type === 'pictureHunt';
                const resolveLabel = (val: string) => {
                  if (!isPic || !log.question.pictureOptions) return val;
                  const match = log.question.pictureOptions.find((p) => p.id === val);
                  return match ? `${match.label}${match.caption ? ` (${match.caption})` : ''}` : val;
                };

                return (
                  <div
                    key={log.question.id}
                    className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
                      log.isCorrect
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-red-50/40 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-700">
                        Item {index + 1} · {getGameTypeLabel(log.question.type).name}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          log.isCorrect ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {log.isCorrect ? '✓ CORRECT' : '✕ MISSED'}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">{log.question.prompt}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs pt-1">
                      <span>
                        <strong className="text-slate-600">Your Answer:</strong>{' '}
                        <span className={log.isCorrect ? 'text-emerald-800 font-semibold' : 'text-red-700 font-semibold'}>
                          {resolveLabel(log.studentAnswer)}
                        </span>
                      </span>
                      {!log.isCorrect && (
                        <span>
                          <strong className="text-slate-600">Correct Answer:</strong>{' '}
                          <span className="text-emerald-800 font-semibold">
                            {resolveLabel(log.question.answer)}
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 pt-1">
                      <strong>Feedback:</strong> {log.question.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => startQuizSession()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Quiz</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setStage('QUIZ_SETUP');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Change Difficulty / Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setStage('LESSON');
                }}
                className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Go back to the module lesson"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                <span>Back to Module Lesson</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleGoToStudentDashboard}
                className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Go to Home"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  onBackToMap();
                }}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Return to Island Map
              </button>

              {(finalOutcome.passed || isPreviewMode) && nextModule && (
                <button
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    onAdvanceToNextModule(nextModule);
                  }}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isPreviewMode ? 'Preview Next Module' : `Continue to ${nextModule.pdfLesson?.sourceLabel || `Module ${nextModule.moduleNumber}`}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
