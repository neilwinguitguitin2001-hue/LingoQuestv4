import test from 'node:test';
import assert from 'node:assert/strict';
import {privacyAction} from '../src/server/privacyActions';
import {reportCsv,reportHtml,philippineDate,type MonthlyReport} from '../src/utils/monthlyReports';
const report:MonthlyReport={scope:'assigned-students',period:'2026-11',kind:'games',generated_at:'2026-11-20T08:00:00Z',timezone:'Asia/Manila',grade:7,section:null,columns:[{key:'student',label:'Student'},{key:'occurred_at',label:'Completed'}],rows:[{student:'=HYPERLINK("bad") <script>',occurred_at:'2026-10-31T16:00:00Z'}],total:1,limited:false,notes:['Monthly records only']};
test('monthly API validates filters and accepts no arbitrary student or table scope',async()=>{
 let args:any;await privacyAction({action:'monthlyReport',period:'2026-11',kind:'games',grade:7,section:' A '},async(name,input)=>{args={name,input};return [];});
 assert.equal(args.name,'privacy_monthly_report');assert.equal(args.input.p_section,'A');
 for(const extra of [{period:'2026-13'},{kind:'users'},{grade:11},{studentId:'another-student'},{section:'a'.repeat(101)}])await assert.rejects(privacyAction({action:'monthlyReport',period:'2026-11',kind:'games',...extra},async()=>[]));
});
test('CSV quotes fields, preserves Unicode and neutralizes spreadsheet formulas',()=>{
 const csv=reportCsv(report);assert.ok(csv.startsWith('\uFEFF'));assert.match(csv,/"'=HYPERLINK\(""bad""\)/);assert.ok(csv.includes('\r\n'));assert.ok(csv.includes('Monthly records only'));
});
test('print report renders actual escaped text and tables, never screenshot images',()=>{
 const html=reportHtml(report);assert.match(html,/<table>/);assert.match(html,/<thead>/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>|<img|<canvas/);assert.match(html,/2026-11/);assert.match(html,/Monthly records only/);
});
test('Philippine timestamp crosses UTC boundary into the correct local date',()=>{
 const date=philippineDate('2026-10-31T16:00:00Z');assert.match(date,/Nov/);assert.match(date,/01/);
});
