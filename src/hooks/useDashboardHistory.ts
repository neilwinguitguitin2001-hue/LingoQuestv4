import {useEffect,useRef,useState} from 'react';
export const navigationEvent='lingoquest:before-page-leave';
export function canLeavePage(){return window.dispatchEvent(new Event(navigationEvent,{cancelable:true}));}
type Page={view:string;moduleId:string};
type Entry=Page&{token:string;index:number};
export function validHistoryEntry(value:unknown,token:string,count:number):value is Entry{
 if(!value||typeof value!=='object')return false;const entry=value as Entry;
 return entry.token===token&&Number.isInteger(entry.index)&&entry.index>=0&&entry.index<count;
}
export function useDashboardHistory(view:string,moduleId:string,userId:string,restore:(page:Page)=>void){
 const restoreRef=useRef(restore);restoreRef.current=restore;
 const track=useRef<{token:string;user:string;entries:Page[];index:number;restoring:boolean}|null>(null);
 const [backLabel,setBackLabel]=useState<string|null>(null);
 useEffect(()=>{
  const page={view,moduleId};let state=track.current;
  if(!state||state.user!==userId||view==='AUTH'||view==='WAITING_APPROVAL'||state.entries[state.index]?.view==='AUTH'||state.entries[state.index]?.view==='WAITING_APPROVAL'){
   state={token:crypto.randomUUID(),user:userId,entries:[page],index:0,restoring:false};track.current=state;
   history.replaceState({...history.state,lqPage:{...page,token:state.token,index:0}},'');setBackLabel(null);return;
  }
  if(state.restoring){state.restoring=false;setBackLabel(state.index?state.entries[state.index-1].view:null);return;}
  if(state.entries[state.index]?.view===view){state.entries[state.index]=page;history.replaceState({...history.state,lqPage:{...page,token:state.token,index:state.index}},'');return;}
  state.entries=state.entries.slice(0,state.index+1);state.entries.push(page);state.index++;
  const url=new URL(location.href);if(url.hash.startsWith('#lesson-'))url.hash='';
  history.pushState({...history.state,lqPage:{...page,token:state.token,index:state.index}},'',url);
  setBackLabel(state.entries[state.index-1]?.view??null);
 },[view,moduleId,userId]);
 useEffect(()=>{
  const pop=(event:PopStateEvent)=>{
   const state=track.current,next=event.state?.lqPage as Entry|undefined;
   if(!state||!validHistoryEntry(next,state.token,state.entries.length))return;
   if(next.index===state.index)return;
   if(!canLeavePage()){history.go(state.index-next.index);return;}
   state.index=next.index;state.restoring=true;restoreRef.current(state.entries[next.index]);
   setBackLabel(state.index?state.entries[state.index-1].view:null);
  };
  window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);
 },[]);
 return {backLabel,goBack:()=>{if(track.current&&track.current.index>0)history.back();}};
}
