import {supabase} from '../lib/supabase';
import type {StudentAccount,UserAccount} from '../types/lingoquest';
export interface GradeBoard {grade:7|8|9|10;visible:boolean;my_alias:string;entries:{alias:string;activity_points:number}[]}
export async function privateRequest<T>(body:Record<string,unknown>,expectedUserId?:string):Promise<T>{
 const {data}=await supabase!.auth.getSession();if(!data.session)throw Error('Please sign in to view this information.');
 if(expectedUserId && data.session.user.id!==expectedUserId)throw Error('Your account changed. Please reopen this page.');
 const r=await fetch('/api/privacy',{method:'POST',headers:{Authorization:`Bearer ${data.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error('This information is not available for your account. Contact the study coordinator if you need access.');
 return r.json();
}
export function profileAccount(p:any):UserAccount{
 const base={id:p.id,name:p.display_name||'',email:p.email||'',username:p.username||'',status:p.status,isActive:p.status==='approved',joinedDate:p.created_at||'',schoolName:p.school_name||''};
 if(p.role==='student')return {...base,role:'student',learnerId:p.lrn||'',lrn:p.lrn||'',gradeLevel:p.grade_level,section:p.section||'',classCode:p.class_code||'',teacherId:p.teacher_id||'',points:0,badges:[],completedModules:[],progressByModule:{},personalizationHistory:[],writingSubmissions:[]};
 if(p.role==='teacher')return {...base,role:'teacher',department:'',employeeId:'',depEdEmail:p.email||'',classCode:p.class_code||''};
 return {...base,role:'admin',adminTitle:'Administrator',employeeId:'',isMainAdmin:false,permissions:{canApproveTeachers:false,canManageModules:false,canViewStudentProgress:false,canManageSubAdmins:false}};
}
export function reportStudent(r:any):StudentAccount{
 return {...profileAccount({id:r.student.id,display_name:r.student.name,role:'student',status:'approved',grade_level:r.student.grade}) as StudentAccount,
 teacherId:r.student.teacher_id||'',points:r.progress?.xp||0,badges:r.progress?.badges||[],completedModules:r.progress?.completed_quests||[],progressByModule:r.progress?.progress_by_module||{}};
}
export async function privateBootstrap(){
 const data=await privateRequest<any>({action:'bootstrap'});
 const own=profileAccount(data.profile),students=(data.students||[]).map(reportStudent) as StudentAccount[];
 if(own.role==='teacher') for(const s of students) if(s.teacherId===own.id) s.classCode=own.classCode;
 if(own.role==='admin' && own.permissions) own.permissions.canViewStudentProgress=students.length>0;
 const ownStudent=students.find(s=>s.id===own.id);
 const users:UserAccount[]=[ownStudent?{...own,points:ownStudent.points,badges:ownStudent.badges,completedModules:ownStudent.completedModules,progressByModule:ownStudent.progressByModule} as StudentAccount:own,...students.filter(s=>s.id!==own.id)];
 return {users,customModules:[],auditLogs:[],emailNotifications:[],systemFeedback:[]};
}
export async function privateLogin(identifier:string,password:string,role:string){
 if(!supabase)throw Error('Private account access is not configured.');
 const r=await fetch('/api/account-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifier,password,role})});
 const data=await r.json();if(!r.ok)throw Error(data.error||'Unable to sign in.');
 const {error}=await supabase.auth.setSession(data.session);if(error)throw error;
 const boot=await privateBootstrap();const {data:session}=await supabase.auth.getUser();
 const own=boot.users.find(u=>u.id===session.user?.id);if(!own)throw Error('Account not available.');return own;
}
