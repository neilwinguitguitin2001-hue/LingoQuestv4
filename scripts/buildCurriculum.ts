import * as fs from 'fs';
import * as path from 'path';

// Define the blueprint structure
interface ModuleBlueprint {
  grade: number;
  quarter: number;
  qIdx: number;
  overallNum: number;
  title: string;
  topic: string;
  melc: string;
  overview: string;
  rules: string[];
  examples: Array<{ title: string; example: string; analysis: string }>;
  cultural: string;
  warmup: {
    question: string;
    options: string[];
    correctAnswer: string;
    feedback: string;
  };
  writing: {
    title: string;
    instructions: string;
    sampleStarter: string;
  };
  quiz: {
    analogyPrompt: string;
    analogyA: string;
    analogyB: string;
    analogyC: string;
    analogyType: string;
    analogyAnswer: string;
    analogyDistractors: string[];
    analogyExp: string;
    
    missingPrompt: string;
    missingSentence: string;
    missingAnswer: string;
    missingDistractors: string[];
    missingExp: string;
    
    picturePrompt: string;
    pictureLabel1: string;
    pictureCaption1: string;
    pictureLabel2: string;
    pictureCaption2: string;
    pictureAnswer: 'p1' | 'p2';
    pictureExp: string;
    
    crosswordPrompt: string;
    crosswordWord: string;
    crosswordClue: string;
    crosswordDistractors: string[];
    crosswordExp: string;
    
    typePrompt: string;
    typeWord: string;
    typeHint: string;
    typeExp: string;
  };
}

const ISLANDS: Record<number, { name: string; color: string; muni: string }> = {
  1: { name: 'Pujada Island', color: '#0284C7', muni: 'Mati City' },
  2: { name: 'Waniban Island', color: '#059669', muni: 'Mati City' },
  3: { name: 'Oak Island', color: '#D97706', muni: 'Mati City' },
  4: { name: 'San Victor Island', color: '#7C3AED', muni: 'Baganga' },
};

function generateModuleCode(bp: ModuleBlueprint): string {
  const island = ISLANDS[bp.quarter];
  const modId = `g${bp.grade}-q${bp.quarter}-m${bp.qIdx}`;
  
  return `  {
    id: '${modId}',
    gradeLevel: ${bp.grade},
    quarter: ${bp.quarter},
    moduleNumber: ${bp.overallNum},
    quarterModuleIndex: ${bp.qIdx},
    islandName: '${island.name}',
    islandThemeColor: '${island.color}',
    title: ${JSON.stringify(bp.title)},
    topicType: '${bp.topic}' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: ${JSON.stringify(bp.overview)},
      melcCompetency: ${JSON.stringify(bp.melc)},
      keyRules: ${JSON.stringify(bp.rules, null, 8).trim()},
      examples: ${JSON.stringify(bp.examples, null, 8).trim()},
      culturalConnection: ${JSON.stringify(bp.cultural)},
      warmupQuestion: ${JSON.stringify(bp.warmup, null, 8).trim()},
      writingPrompt: ${JSON.stringify(bp.writing, null, 8).trim()}
    },
    quizQuestions: [
      {
        id: '${modId}-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: ${JSON.stringify(bp.quiz.analogyPrompt)},
        analogyPair: {
          firstA: ${JSON.stringify(bp.quiz.analogyA)},
          firstB: ${JSON.stringify(bp.quiz.analogyB)},
          secondC: ${JSON.stringify(bp.quiz.analogyC)},
          relationshipType: ${JSON.stringify(bp.quiz.analogyType)}
        },
        options: ${JSON.stringify([bp.quiz.analogyAnswer, ...bp.quiz.analogyDistractors].sort(() => 0.5 - Math.random()))},
        answer: ${JSON.stringify(bp.quiz.analogyAnswer)},
        explanation: ${JSON.stringify(bp.quiz.analogyExp)},
        timeLimitSeconds: 45
      },
      {
        id: '${modId}-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: ${JSON.stringify(bp.quiz.missingPrompt)},
        contextSentence: ${JSON.stringify(bp.quiz.missingSentence)},
        options: ${JSON.stringify([bp.quiz.missingAnswer, ...bp.quiz.missingDistractors].sort(() => 0.5 - Math.random()))},
        answer: ${JSON.stringify(bp.quiz.missingAnswer)},
        explanation: ${JSON.stringify(bp.quiz.missingExp)},
        timeLimitSeconds: 45
      },
      {
        id: '${modId}-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: ${JSON.stringify(bp.quiz.picturePrompt)},
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: ${JSON.stringify(bp.quiz.pictureLabel1)}, caption: ${JSON.stringify(bp.quiz.pictureCaption1)} },
          { id: 'p2', sceneId: 'coastal_horizon', label: ${JSON.stringify(bp.quiz.pictureLabel2)}, caption: ${JSON.stringify(bp.quiz.pictureCaption2)} }
        ],
        answer: '${bp.quiz.pictureAnswer}',
        explanation: ${JSON.stringify(bp.quiz.pictureExp)},
        timeLimitSeconds: 45
      },
      {
        id: '${modId}-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: ${JSON.stringify(bp.quiz.crosswordPrompt)},
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: ${bp.quiz.crosswordWord.length},
          cluePrompt: ${JSON.stringify(bp.quiz.crosswordClue)}
        },
        options: ${JSON.stringify([bp.quiz.crosswordWord, ...bp.quiz.crosswordDistractors].sort(() => 0.5 - Math.random()))},
        answer: ${JSON.stringify(bp.quiz.crosswordWord)},
        explanation: ${JSON.stringify(bp.quiz.crosswordExp)},
        timeLimitSeconds: 45
      },
      {
        id: '${modId}-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: ${JSON.stringify(bp.quiz.typePrompt)},
        hint: ${JSON.stringify(bp.quiz.typeHint)},
        answer: ${JSON.stringify(bp.quiz.typeWord.toLowerCase())},
        explanation: ${JSON.stringify(bp.quiz.typeExp)},
        timeLimitSeconds: 45
      }
    ]
  }`;
}

export { type ModuleBlueprint, generateModuleCode, ISLANDS };
