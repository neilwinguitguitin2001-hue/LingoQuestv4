import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {validHistoryEntry,canLeavePage,navigationEvent} from '../src/hooks/useDashboardHistory';
import {PageBackNavigation} from '../src/components/PageBackNavigation';
import {DashboardSectionBack} from '../src/components/DashboardSectionBack';
test('history rejects entries from an old account session or invalid index',()=>{
 assert.equal(validHistoryEntry({token:'current',index:0},'current',2),true);
 for(const value of [null,{}, {token:'old-account',index:0},{token:'current',index:-1},{token:'current',index:2},{token:'current',index:0.5},{token:'current',index:'0'}])assert.equal(validHistoryEntry(value,'current',2),false);
});
test('navigation event can be cancelled before a page is changed',()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'window');const target=new EventTarget();Object.defineProperty(globalThis,'window',{configurable:true,value:target});
 try{assert.equal(canLeavePage(),true);const deny=(event:Event)=>event.preventDefault();target.addEventListener(navigationEvent,deny);assert.equal(canLeavePage(),false);target.removeEventListener(navigationEvent,deny);assert.equal(canLeavePage(),true);}finally{if(original)Object.defineProperty(globalThis,'window',original);else delete (globalThis as any).window;}
});
test('back controls clearly name destinations and provide a dashboard fallback',()=>{
 const html=renderToStaticMarkup(<PageBackNavigation backView="MARKET" onBack={()=>{}} onHome={()=>{}}/>);
 assert.match(html,/Back to Quest Market/);assert.match(html,/Dashboard home/);assert.match(html,/aria-label="Page navigation"/);
 const root=renderToStaticMarkup(<PageBackNavigation backView={null} onBack={()=>{}} onHome={()=>{}}/>);assert.doesNotMatch(root,/Back to /);assert.match(root,/Dashboard home/);
});
test('dashboard section back is a native keyboard-accessible button',()=>{
 const html=renderToStaticMarkup(<DashboardSectionBack label="Back to student roster" onBack={()=>{}}/>);assert.match(html,/<button type="button"/);assert.match(html,/Back to student roster/);
});
