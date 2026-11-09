export type PrivacyRpc = (name: string, args?: Record<string,unknown>) => Promise<unknown>;
// An export uses exactly the same authorized report as the screen. No arbitrary query/table access.
export async function privacyAction(body: unknown, rpc: PrivacyRpc): Promise<unknown> {
  if(!body||typeof body!=='object'||Array.isArray(body))throw Error('Invalid request');
  const b=body as Record<string,unknown>;
  const allowed:Record<string,string[]>={board:['action','grade'],visibility:['action','visible'],report:['action','studentId'],export:['action','studentId'],summary:['action'],bootstrap:['action'],noticeStatus:['action'],acknowledgeNotice:['action','version','termsAccepted']};
  const action=String(b.action);if(!allowed[action]||Object.keys(b).some(k=>!allowed[action].includes(k)))throw Error('Invalid request');
  if(action==='noticeStatus')return rpc('privacy_notice_status');
  if(action==='acknowledgeNotice'){
    if(b.version!=='2026-11-09-preview-1'||typeof b.termsAccepted!=='boolean')throw Error('Invalid acknowledgement');
    return rpc('privacy_acknowledge_notice',{p_version:b.version,p_terms:b.termsAccepted});
  }
  if(action==='board'){
    if(b.grade!==undefined&&(!Number.isInteger(b.grade)||Number(b.grade)<7||Number(b.grade)>10))throw Error('Invalid grade');
    return rpc('privacy_grade_board',{p_grade:b.grade??null});
  }
  if(action==='visibility'){
    if(typeof b.visible!=='boolean')throw Error('Invalid preference');
    return rpc('privacy_set_board_visibility',{p_visible:b.visible});
  }
  if(action==='report'||action==='export'){
    if(typeof b.studentId!=='string'||!/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(b.studentId))throw Error('Invalid record');
    return rpc('privacy_individual_report',{p_student:b.studentId});
  }
  return rpc(action==='summary'?'privacy_admin_summary':'privacy_bootstrap');
}
