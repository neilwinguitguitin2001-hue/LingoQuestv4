import React, { useMemo, useState } from 'react';
import type { Module } from '../types/lingoquest';
import type { PdfExcerpt, PdfLesson } from '../data/curriculum/pdfCurriculum';
import { useDigitalContent, type DigitalBlock, type DigitalContent } from '../data/curriculum/digitalContent';
import { createSourceGameSession, SOURCE_GAME_MODES } from '../utils/sourceGameSession';

const SECTIONS = [['concepts','Concepts & Rules'],['guidedAnalysis','Guided Analysis'],['pitfallsAndTips','Pitfalls & Tips'],['vocabularyBank','Vocabulary Bank'],['selfCheck','Self-Check'],['studyCheatsheet','Study Cheatsheet']] as const;
type Section = typeof SECTIONS[number][0];
const NAMES = {typeHunter:'Word Hunter',missingPiece:'Missing Piece',crosswordGame:'Crossword',analogyMaster:'Analogy Master',pictureHunt:'Picture Hunt'};

export function QuestCompanion({celebrate=false}:{celebrate?:boolean}) {
  return <svg className={`quest-companion ${celebrate?'quest-cheer':''}`} viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="41" fill="#bae6fd"/><path d="M27 34 Q50 13 73 34 L77 67 Q50 87 23 67Z" fill="#0369a1"/><path d="M32 42 Q50 33 68 42 V65 Q50 77 32 65Z" fill="#ecfeff"/><circle cx="41" cy="51" r="4" fill="#0c4a6e"/><circle cx="60" cy="51" r="4" fill="#0c4a6e"/><path d="M43 62 Q50 69 58 61" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round"/><path d="M50 7 L54 17 L64 21 L54 25 L50 35 L46 25 L36 21 L46 17Z" fill="#34d399"/></svg>;
}
function Citation({lesson,page}:{lesson:PdfLesson;page:number}) {return <a className="source-cite" href={`${lesson.source.url}#page=${page}`} target="_blank" rel="noreferrer">{lesson.sourceLabel} · PDF p. {page}</a>;}
function Highlight({text,terms}:{text:string;terms:string[]}) {
  const parts = text.split(/(\s+)/);
  const words = new Set(terms.flatMap(t=>t.toLowerCase().split(/\s+/)));
  return <>{parts.map((part,i)=>words.has(part.toLowerCase().replace(/[^a-z-]/g,''))?<mark key={i}>{part}</mark>:part)}</>;
}
export function SourceGraphic({block}:{block:DigitalBlock}) {
  return <svg className="source-game-graphic" viewBox={`-6 -6 ${(block.width||400)+12} ${(block.height||180)+12}`} aria-label="Illustration from the source PDF">{block.shapes?.map((s,i)=><path key={i} d={s.d} stroke={s.stroke} fill={s.fill} strokeWidth={s.width}/>)}{block.images?.map((image,i)=><image key={'image-'+i} href={image.src} x={image.x} y={image.y} width={image.width} height={image.height} role="img" aria-label={image.alt || 'Source illustration'}/>)}{block.labels?.map((l,i)=><text key={i} x={l.x} y={l.y} fontSize={l.size} fill="#082f49">{l.text}</text>)}</svg>;
}
function Diagram({block}:{block:DigitalBlock}) {
  const [selected,setSelected] = useState('');
  return <div className="source-diagram"><div className="diagram-viewport" tabIndex={0} role="region" aria-label="Source diagram"><svg viewBox={`-6 -6 ${(block.width||400)+12} ${(block.height||180)+12}`} aria-label="Diagram extracted from the source PDF">
    {block.shapes?.map((s,i)=><path key={i} d={s.d} stroke={s.stroke} fill={s.fill} strokeWidth={s.width}/>)}
    {block.labels?.map((l,i)=><text key={i} x={l.x} y={l.y} fontSize={l.size} fill="#082f49" role="button" tabIndex={0} aria-label={l.text} onFocus={()=>setSelected(l.text)} onClick={()=>setSelected(l.text)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(l.text);}}}>{l.text}</text>)}
  </svg></div><p className="diagram-label" aria-live="polite">{selected || 'Select a diagram label to read it here.'}</p></div>;
}
function Block({block,terms}:{block:DigitalBlock;terms:string[]}) {
  if(block.type==='table') return <div className="source-table-wrap" tabIndex={0} role="region" aria-label={`Source table on PDF page ${block.page}`}><table className="source-table"><tbody>{block.rows?.map((row,i)=><tr key={i}>{row.map((cell,j)=>i===0?<th scope="col" key={j}>{cell||' '}</th>:<td key={j}>{cell||'—'}</td>)}</tr>)}</tbody></table></div>;
  if(block.type==='figure')return <figure className="source-figure"><img src={block.src} alt={`Illustration from the learning module, PDF page ${block.page}`} loading="lazy" width={block.width} height={block.height}/><figcaption>Source illustration · PDF p. {block.page}</figcaption>{block.transcript && <details><summary>Selectable image labels</summary><p className="source-paragraph">{block.transcript}</p></details>}</figure>;
  if(block.type==='diagram')return <Diagram block={block}/>;
  if(block.type==='heading')return <h3 className="source-subheading">{block.text}</h3>;
  const lines=(block.text||'').split('\n');
  if(lines.length>1 && lines.some(x=>/^\s*(\d+[.)]|[•●✓✔])/.test(x)))return <ul className="source-list">{lines.map((line,i)=><li key={i}><Highlight text={line} terms={terms}/></li>)}</ul>;
  return <p className="source-paragraph"><Highlight text={block.text||''} terms={terms}/></p>;
}
function Excerpt({excerpt,lesson,content,section,index,terms}:{excerpt:PdfExcerpt;lesson:PdfLesson;content?:DigitalContent;section:string;index:number;terms:string[]}) {
  const ids=content?.excerptBlocks[`${section}:${index}`];
  const blocks=ids?.map(id=>content!.blocks[id]).filter(Boolean) || excerpt.text.split(/\n\s*\n/).filter(Boolean).map(text=>({type:'paragraph' as const,text,page:excerpt.page}));
  return <article className={`source-card source-${section}`}><Citation lesson={lesson} page={excerpt.page}/><div className="source-blocks">{blocks.slice(0,4).map((block,i)=><Block key={i} block={block} terms={terms}/>)}{blocks.length>4&&<details className="expanded-source"><summary>Explore the remaining explanation and examples ({blocks.length-4} source elements)</summary>{blocks.slice(4).map((block,i)=><Block key={i} block={block} terms={terms}/>)}</details>}</div></article>;
}
function VocabularyCard({excerpt,lesson}:{excerpt:PdfExcerpt;lesson:PdfLesson}) {
  const [flipped,setFlipped]=useState(false);
  const match=excerpt.text.match(/^(.{2,70}?)\s+(?:is|are|means|refers to)\b/);
  const term=excerpt.term||match?.[1]||excerpt.text.split(/[.:]/)[0];
  return <article className={`vocab-card ${flipped?'is-flipped':''}`}><button type="button" aria-pressed={flipped} aria-label={`${term}: ${flipped?'hide':'show'} source definition`} onClick={()=>setFlipped(!flipped)}><span className="vocab-front" aria-hidden={flipped}><svg aria-hidden="true" viewBox="0 0 60 48"><path d="M4 5 Q18 0 30 8 Q42 0 56 5 V40 Q42 35 30 44 Q18 35 4 40Z" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M30 8 V44" stroke="currentColor" strokeWidth="2"/></svg><strong>{term}</strong><span>Reveal definition ↗</span></span><span className="vocab-back" aria-hidden={!flipped}>{excerpt.text}</span></button><Citation lesson={lesson} page={excerpt.page}/></article>;
}
export function PdfLessonView({module,initialSelfCheck=false,onBack,onComplete,onStartGames}:{module:Module;initialSelfCheck?:boolean;onBack:()=>void;onComplete:()=>void;onStartGames?:()=>void}) {
  const lesson=module.pdfLesson!;
  const {data:content,error,retry}=useDigitalContent(lesson);
  const [active,setActive]=useState<Section>(initialSelfCheck?'selfCheck':'concepts');
  const [step,setStep]=useState(0);
  const [expanded,setExpanded]=useState(4);
  const [responses,setResponses]=useState<Record<string,string>>({});
  const [reviewed,setReviewed]=useState<Record<string,boolean>>({});
  const [completed,setCompleted]=useState(false);
  const [copyStatus,setCopyStatus]=useState('');
  const terms=useMemo(()=>lesson.vocabularyBank.map(v=>v.term || v.text.match(/^(.{2,55}?)\s+(?:is|are|means|refers to)\b/)?.[1]||'').filter(Boolean),[lesson.id]);
  const excerpts=lesson[active];
  const label=SECTIONS.find(([key])=>key===active)![1];
  const renderExcerpt=(e:PdfExcerpt,i:number)=><Excerpt key={`${active}-${i}`} excerpt={e} lesson={lesson} content={content} section={active} index={i} terms={terms}/>;
  return <div className="digital-learning">
    <div className="lesson-toolbar"><button type="button" onClick={onBack}>← Back to modules</button><div>{onStartGames&&<button type="button" onClick={onStartGames}>Open game challenges →</button>}<button type="button" className="primary-action" disabled={completed} onClick={()=>{onComplete();setCompleted(true);}}>{completed?'Lesson studied ✓':'Mark lesson studied'}</button></div></div>
    <header className="digital-hero"><div><p className="eyebrow">Grade {lesson.grade} · Quarter {lesson.quarter} · {lesson.sourceLabel}</p><h1>{lesson.title}</h1><h2>Lesson Concept / Overview</h2><p className="hero-overview">{lesson.overview.text}</p><Citation lesson={lesson} page={lesson.overview.page}/></div><QuestCompanion celebrate={completed}/><a className="source-file" href={lesson.source.url} target="_blank" rel="noreferrer">↗ {lesson.source.fileName}</a>{lesson.source.notes.map(note=><p className="source-notice" key={note}>{note}</p>)}</header>
    <nav className="lesson-tabs" aria-label="Lesson sections">{SECTIONS.map(([key,name],i)=><button type="button" key={key} aria-pressed={active===key} onClick={()=>{setActive(key);setExpanded(4);setStep(0);}}><span aria-hidden="true">{['◈','◇','↔','▣','✓','✦'][i]}</span>{name}</button>)}</nav>
    {error&&<div role="alert" className="source-notice">{error} <button type="button" onClick={retry}>Retry source content</button></div>}
    <section aria-label={label} className={`digital-section section-${active}`}><div className="section-heading"><h2>{label}</h2><span>{excerpts.length} source {active==='vocabularyBank'?'definitions':'selections'}</span></div>
      {excerpts.length===0&&<p className="empty-source">No separate source-supported material has been identified for this section.</p>}
      {active==='vocabularyBank'?<div className="vocab-grid">{excerpts.map((e,i)=><VocabularyCard key={i} excerpt={e} lesson={lesson}/>)}</div>
      :active==='guidedAnalysis'&&excerpts.length>0?<div className="guided-workbench"><div className="guided-steps" aria-label="Source example selector">{excerpts.map((e,i)=><button type="button" key={i} aria-pressed={step===i} onClick={()=>setStep(i)}>{i+1}<span>p. {e.page}</span></button>)}</div><div className="step-progress" role="progressbar" aria-label="Source examples explored" aria-valuenow={step+1} aria-valuemin={1} aria-valuemax={excerpts.length}><span style={{width:`${(step+1)/excerpts.length*100}%`}}/></div>{renderExcerpt(excerpts[step],step)}<div className="step-controls"><button type="button" disabled={step===0} onClick={()=>setStep(n=>n-1)}>← Previous</button><span>Example / activity {step+1} of {excerpts.length}</span><button type="button" disabled={step===excerpts.length-1} onClick={()=>setStep(n=>n+1)}>Next →</button></div></div>
      :active==='studyCheatsheet'?<div className="cheatsheet-map">{excerpts.map((e,i)=><div className="takeaway-node" key={i}><span className="takeaway-number" aria-hidden="true">{i+1}</span><p><Highlight text={e.text} terms={terms}/></p><Citation lesson={lesson} page={e.page}/></div>)}<button type="button" onClick={async()=>{try{await navigator.clipboard.writeText([lesson.title,lesson.source.url,...excerpts.map(e=>`PDF p. ${e.page}: ${e.text}`)].join('\n\n'));setCopyStatus('Study notes copied.');}catch{setCopyStatus('Select the notes to copy them.');}}}>Copy study notes</button><span role="status">{copyStatus}</span></div>
      :<div className="lesson-card-grid">{excerpts.slice(0,expanded).map((e,i)=><div key={i}>{active==='selfCheck'?<details className="review-task" open={i===0}><summary>Review activity {i+1} · PDF p. {e.page} {reviewed[String(i)]?'✓':''}</summary>{renderExcerpt(e,i)}<label>Your response<textarea rows={4} value={responses[String(i)]||''} onChange={event=>setResponses(prev=>({...prev,[i]:event.target.value}))}/></label><label className="review-check"><input type="checkbox" checked={!!reviewed[String(i)]} onChange={event=>setReviewed(prev=>({...prev,[i]:event.target.checked}))}/>Reviewed against the source</label></details>:renderExcerpt(e,i)}</div>)}</div>}
      {!['guidedAnalysis','vocabularyBank','studyCheatsheet'].includes(active)&&expanded<excerpts.length&&<button className="load-more" type="button" onClick={()=>setExpanded(n=>n+4)}>Explore more source material ({excerpts.length-expanded})</button>}
      {active==='selfCheck'&&<><div className="challenge-availability"><h3>Five-question game challenges</h3><p>Each difficulty uses exactly five distinct, verified source items. Open responses use the PDF’s checking guide.</p><div>{SOURCE_GAME_MODES.map(mode=>{const ready=content&&createSourceGameSession(module,content.games,mode,'easy',()=>.5);return <p key={mode}><strong>{NAMES[mode]}</strong><span className={ready?'ready-tag':'review-tag'}>{!content?'Loading source bank…':ready?'5 verified questions · Ready':'Source review needed · Not playable'}</span></p>;})}</div>{onStartGames&&<button type="button" className="primary-action" onClick={onStartGames}>Choose a game and difficulty →</button>}</div><details className="checking-guide"><summary>Source answer key / checking guide</summary><p>Use the original answers and rubrics below. Open responses and performances may need teacher feedback.</p>{lesson.answerKey.map((e,i)=><Excerpt key={i} excerpt={e} lesson={lesson} content={content} section="answerKey" index={i} terms={terms}/>)}{lesson.answerKey.length===0&&<a href={lesson.source.url} target="_blank" rel="noreferrer">Open the original PDF to review its checking guidance</a>}</details></>}
    </section>
  </div>;
}
