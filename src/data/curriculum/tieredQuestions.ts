import type {QuizQuestion, QuizGameType, DifficultyLevel} from '../../types/lingoquest';
export interface LearningTarget {term:string;quote:string;page:number;selection:string}
export interface ModuleTargets {moduleId:string;fileId:string;pdfSha256:string;title:string;anchors:LearningTarget[]}
const modes:QuizGameType[]=['analogyMaster','missingPiece','pictureHunt','crosswordGame','typeHunter'];
const levels:DifficultyLevel[]=['easy','moderate','hard'];
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const match=(term:string)=>new RegExp(`(?<![A-Za-z\\-])${escape(term)}(?![A-Za-z]|[-'’][A-Za-z])`,'gi');
const stop=new Set('there their these those which about could should would being because before after example examples source statement information following usually through between directly another sentence'.split(' '));
function secondary(target:LearningTarget,others:LearningTarget[]):string {
 const other=others.find(o=>o.term.toLowerCase()!==target.term.toLowerCase()&&match(o.term).test(target.quote)&&!target.term.toLowerCase().includes(o.term.toLowerCase())&&!o.term.toLowerCase().includes(target.term.toLowerCase()));
 if(other)return other.term;
 return [...target.quote.matchAll(/\b[A-Za-z]{5,18}\b/g)].map(m=>m[0]).filter(w=>!stop.has(w.toLowerCase())&&!target.term.toLowerCase().includes(w.toLowerCase())).sort((a,b)=>b.length-a.length)[0]||'';
}
export function compileModuleQuestions(module:ModuleTargets):QuizQuestion[] {
 if(module.anchors.length!==5)throw new Error(`${module.moduleId}: five reviewed topic targets required`);
 const result:QuizQuestion[]=[];
 for(const [index,target] of module.anchors.entries())for(const difficulty of levels)for(const mode of modes){
  const targetId=`${module.moduleId}-target-${index+1}`;const id=`${targetId}-${difficulty}-${mode}`;const second=secondary(target,module.anchors);
  const double=difficulty==='hard'&&mode!=='crosswordGame'&&!!second;
  const spans=double?[target.term,second]:[target.term];
  let context=target.quote.replace(match(target.term),double?'[1] ________':'________');
  if(double)context=context.replace(match(second),'[2] ________');
  const answer=spans.join(' / ');
  const distractors=module.anchors.filter((_,i)=>i!==index).map(a=>double?`${a.term} / ${second}`:a.term).filter(x=>x.toLowerCase()!==answer.toLowerCase());
  const choices=[answer,...distractors].slice(0,difficulty==='easy'?2:4);
  const clue=double?'Restore gaps [1] and [2] in order; separate your answers with “ / ”.':'Restore the missing term exactly as it appears in the lesson.';
  const base:QuizQuestion={id,type:mode,difficulty,prompt:clue,contextSentence:context,answer,explanation:`The lesson states: “${target.quote}” ${double?`The two missing expressions are “${target.term}” and “${second}”.`:`The missing expression is “${target.term}”.`}`,timeLimitSeconds:difficulty==='easy'?60:difficulty==='moderate'?60:90,learningTargetId:targetId,assessmentKey:`${targetId}-${difficulty}`,source:{fileId:module.fileId,page:target.page,quote:target.quote,answerQuote:target.term,answerSpans:spans,sourceId:id,kind:'pdf-topic-completion'}};
  if(difficulty==='easy')base.hint=`Starts with “${target.term[0]}” · ${target.term.length} characters`;
  if(mode==='analogyMaster'){
   base.prompt='Master Quiz: which source excerpt is correctly restored by the given expression(s)?';
   base.contextSentence=answer;
   base.answer=context;
   const alternatives=module.anchors.filter((_,i)=>i!==index).map(a=>{let value=a.quote.replace(match(a.term),double?'[1] ________':'________');if(double){const next=secondary(a,module.anchors);if(next)value=value.replace(match(next),'[2] ________');}return value;});
   base.options=[...new Set([context,...alternatives])].slice(0,difficulty==='easy'?2:4);
   base.assessmentStyle='restore-excerpt';
  }
  if(mode==='missingPiece'){base.prompt=`Missing Piece: ${clue}`;base.options=choices;}
  if(mode==='typeHunter')base.prompt=`Word Hunter: ${clue}`;
  if(mode==='crosswordGame'){
   base.prompt='Solve the source-based word grid. Spaces between words are part of the answer.';
   const letters=[...target.term].map((letter,i)=>({index:i,letter,isGiven:letter===' '||(difficulty==='easy'?i%2===0:difficulty==='moderate'?i===0:false)}));
   base.crosswordClue={direction:index%2===0?'ACROSS':'DOWN',clueNumber:index+1,wordLength:target.term.length,cluePrompt:context,letterGrid:letters};
   if(difficulty==='easy')base.options=choices;
  }
  if(mode==='pictureHunt'){
   base.prompt=`Picture & Concept Hunt: select the card that ${double?'restores both numbered gaps in order.':'completes the lesson explanation.'}`;
   base.pictureOptions=choices.map((value,i)=>({id:`${id}-card-${i}`,sceneId:'ancient_scroll',label:value,caption:'',conceptVisual:{tokens:value.split(' / '),variant:index%3}}));
   base.answer=base.pictureOptions[0].id;
  }
  result.push(base);
 }
 return result;
}
