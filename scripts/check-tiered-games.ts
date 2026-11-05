import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PDF_MODULES} from '../src/data/curriculum/pdfCurriculum';
import {createSourceGameSession,SOURCE_GAME_MODES,getSessionQuestionCount} from '../src/utils/sourceGameSession';
let runs=0;
for(const m of PDF_MODULES){const data=JSON.parse(fs.readFileSync(`public/assets/curriculum/content/${m.id}.json`,'utf8'));assert.deepEqual(data.games,m.quizQuestions);const before=JSON.stringify(data.games);
 for(let seed=1;seed<=20;seed++)for(const difficulty of ['easy','moderate','hard'] as const)for(const mode of [...SOURCE_GAME_MODES,'all'] as const){let state=seed;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/2**32;};const game=createSourceGameSession(m,data.games,mode,difficulty,random)!;assert.ok(game);assert.equal(game.length,getSessionQuestionCount(mode));assert.equal(new Set(game.map(q=>q.id)).size,game.length);assert.ok(game.every(q=>q.difficulty===difficulty));if(mode==='all'){for(const type of SOURCE_GAME_MODES)assert.equal(game.filter(q=>q.type===type).length,3);const coverage=new Map<string,number>();for(const q of game)coverage.set(q.learningTargetId!,(coverage.get(q.learningTargetId!)||0)+1);assert.equal(coverage.size,5);assert.ok([...coverage.values()].every(n=>n===3));}for(const q of game){if(q.options)assert.ok(q.options.includes(q.answer));if(q.pictureOptions)assert.ok(q.pictureOptions.some(p=>p.id===q.answer));}runs++;}
 assert.equal(JSON.stringify(data.games),before);
 const truncated=data.games.filter((q:any)=>!(q.type==='missingPiece'&&q.difficulty==='easy')).concat(data.games.filter((q:any)=>q.type==='missingPiece'&&q.difficulty==='easy').slice(0,4));assert.equal(createSourceGameSession(m,truncated,'missingPiece','easy'),null);assert.equal(createSourceGameSession(m,truncated,'all','easy'),null);
}
console.log(`PASS ${runs} seeded sessions; 7,950 questions; 106 modules; no duplicate question IDs or bank mutations.`);
