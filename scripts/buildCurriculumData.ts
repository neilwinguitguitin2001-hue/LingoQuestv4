import * as fs from 'fs';
import * as path from 'path';

interface RawModDef {
  grade: number;
  quarter: number;
  qIdx: number;
  overallNum: number;
  title: string;
  topic: string;
  melcCode: string;
  melcText: string;
  overview: string;
  rules: string[];
  example1: { title: string; text: string; analysis: string };
  example2: { title: string; text: string; analysis: string };
  cultural: string;
  warmupQ: string;
  warmupOpts: string[];
  warmupAns: string;
  warmupFeedback: string;
  writingTitle: string;
  writingInstr: string;
  writingStarter: string;
  
  // Question parameters
  analogy: { prompt: string; a: string; b: string; c: string; rel: string; ans: string; dist: string[]; exp: string };
  missing: { prompt: string; sentence: string; ans: string; dist: string[]; exp: string };
  picture: { prompt: string; l1: string; c1: string; l2: string; c2: string; ans: 'p1' | 'p2'; exp: string };
  crossword: { prompt: string; word: string; clue: string; dist: string[]; exp: string };
  type: { prompt: string; word: string; hint: string; exp: string };
}

const ISLANDS: Record<number, { name: string; color: string; muni: string }> = {
  1: { name: 'Pujada Island', color: '#0284C7', muni: 'Mati City' },
  2: { name: 'Waniban Island', color: '#059669', muni: 'Mati City' },
  3: { name: 'Oak Island', color: '#D97706', muni: 'Mati City' },
  4: { name: 'San Victor Island', color: '#7C3AED', muni: 'Baganga' },
};

function formatModule(m: RawModDef): string {
  const isl = ISLANDS[m.quarter];
  const modId = `g${m.grade}-q${m.quarter}-m${m.qIdx}`;

  return `  {
    id: '${modId}',
    gradeLevel: ${m.grade},
    quarter: ${m.quarter},
    moduleNumber: ${m.overallNum},
    quarterModuleIndex: ${m.qIdx},
    islandName: '${isl.name}',
    islandThemeColor: '${isl.color}',
    title: ${JSON.stringify(m.title)},
    topicType: '${m.topic}' as any,
    requiredPassingScore: 75,
    lessonContent: {
      overview: ${JSON.stringify(m.overview)},
      melcCompetency: ${JSON.stringify(`${m.melcText} (${m.melcCode})`)},
      keyRules: ${JSON.stringify(m.rules, null, 8).trim()},
      examples: [
        {
          title: ${JSON.stringify(m.example1.title)},
          example: ${JSON.stringify(m.example1.text)},
          analysis: ${JSON.stringify(m.example1.analysis)}
        },
        {
          title: ${JSON.stringify(m.example2.title)},
          example: ${JSON.stringify(m.example2.text)},
          analysis: ${JSON.stringify(m.example2.analysis)}
        }
      ],
      culturalConnection: ${JSON.stringify(m.cultural)},
      warmupQuestion: {
        question: ${JSON.stringify(m.warmupQ)},
        options: ${JSON.stringify(m.warmupOpts)},
        correctAnswer: ${JSON.stringify(m.warmupAns)},
        feedback: ${JSON.stringify(m.warmupFeedback)}
      },
      writingPrompt: {
        title: ${JSON.stringify(m.writingTitle)},
        instructions: ${JSON.stringify(m.writingInstr)},
        sampleStarter: ${JSON.stringify(m.writingStarter)}
      }
    },
    quizQuestions: [
      {
        id: '${modId}-q1',
        type: 'analogyMaster',
        difficulty: 'easy',
        prompt: ${JSON.stringify(m.analogy.prompt)},
        analogyPair: {
          firstA: ${JSON.stringify(m.analogy.a)},
          firstB: ${JSON.stringify(m.analogy.b)},
          secondC: ${JSON.stringify(m.analogy.c)},
          relationshipType: ${JSON.stringify(m.analogy.rel)}
        },
        options: ${JSON.stringify([m.analogy.ans, ...m.analogy.dist])},
        answer: ${JSON.stringify(m.analogy.ans)},
        explanation: ${JSON.stringify(m.analogy.exp)},
        timeLimitSeconds: 45
      },
      {
        id: '${modId}-q2',
        type: 'missingPiece',
        difficulty: 'easy',
        prompt: ${JSON.stringify(m.missing.prompt)},
        contextSentence: ${JSON.stringify(m.missing.sentence)},
        options: ${JSON.stringify([m.missing.ans, ...m.missing.dist])},
        answer: ${JSON.stringify(m.missing.ans)},
        explanation: ${JSON.stringify(m.missing.exp)},
        timeLimitSeconds: 45
      },
      {
        id: '${modId}-q3',
        type: 'pictureHunt',
        difficulty: 'easy',
        prompt: ${JSON.stringify(m.picture.prompt)},
        pictureOptions: [
          { id: 'p1', sceneId: 'cultural_heritage', label: ${JSON.stringify(m.picture.l1)}, caption: ${JSON.stringify(m.picture.c1)} },
          { id: 'p2', sceneId: 'coastal_horizon', label: ${JSON.stringify(m.picture.l2)}, caption: ${JSON.stringify(m.picture.c2)} }
        ],
        answer: '${m.picture.ans}',
        explanation: ${JSON.stringify(m.picture.exp)},
        timeLimitSeconds: 45
      },
      {
        id: '${modId}-q4',
        type: 'crosswordGame',
        difficulty: 'easy',
        prompt: ${JSON.stringify(m.crossword.prompt)},
        crosswordClue: {
          direction: 'ACROSS',
          clueNumber: 1,
          wordLength: ${m.crossword.word.length},
          cluePrompt: ${JSON.stringify(m.crossword.clue)}
        },
        options: ${JSON.stringify([m.crossword.word, ...m.crossword.dist])},
        answer: ${JSON.stringify(m.crossword.word)},
        explanation: ${JSON.stringify(m.crossword.exp)},
        timeLimitSeconds: 45
      },
      {
        id: '${modId}-q5',
        type: 'typeHunter',
        difficulty: 'easy',
        prompt: ${JSON.stringify(m.type.prompt)},
        hint: ${JSON.stringify(m.type.hint)},
        answer: ${JSON.stringify(m.type.word.toLowerCase())},
        explanation: ${JSON.stringify(m.type.exp)},
        timeLimitSeconds: 45
      }
    ]
  }`;
}

export { type RawModDef, formatModule, ISLANDS };
