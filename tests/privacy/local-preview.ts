/** Local-only review harness. Synthetic accounts + isolated PostgreSQL; never deploy this server. */
import express from 'express';
import crypto from 'node:crypto';
import {createServer} from 'vite';
import {database,asUser,uid} from './harness';
import privacyHandler from '../../api/privacy';
import loginHandler from '../../api/account-login';
const port=5642,origin=`http://127.0.0.1:${port}`;
Object.assign(process.env,{VITE_SUPABASE_URL:origin,NEXT_PUBLIC_SUPABASE_URL:origin,SUPABASE_URL:origin,VITE_SUPABASE_ANON_KEY:'local-test-public',SUPABASE_ANON_KEY:'local-test-public',SUPABASE_SERVICE_ROLE_KEY:'local-test-service'});
const db=await database();
const group=uid(100);
for(let n=1;n<=6;n++)await db.query('insert into lq_private.participating_students(student_id,group_id,grade) values($1,$2,$3)',[uid(n),n===3?uid(101):group,n<=3?7:n===4?8:n===5?9:10]);
await db.query('insert into lq_private.teacher_assignments values($1,$2)',[uid(1),uid(7)]);
await db.query('insert into lq_private.activity_completions(student_id,activity_id) values($1,\'game:one:mode\'),($2,\'game:two:mode\')',[uid(1),uid(2)]);
await db.query('update lq_private.participating_students set visible=true where student_id=$1',[uid(2)]);
const secret=crypto.randomBytes(32),tokens=new Map<string,string>();
function jwt(id:string,email:string){const p=Buffer.from(JSON.stringify({sub:id,email,exp:Math.floor(Date.now()/1000)+3600,aud:'authenticated',role:'authenticated'})).toString('base64url');const h=Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url');const raw=h+'.'+p;const token=raw+'.'+crypto.createHmac('sha256',secret).update(raw).digest('base64url');tokens.set(token,id);return token;}
const app=express();app.use(express.json({limit:'32kb'}));
app.post('/auth/v1/token',async(req,res)=>{
 const {email,password}=req.body;const r=await db.query<any>('select id,email from profiles where email=$1',[email]);const user=r.rows[0];
 if(!user||password!=='LocalReview!2026')return res.status(400).json({error:'invalid_grant',error_description:'Invalid credentials'});
 res.json({access_token:jwt(user.id,email),token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,refresh_token:crypto.randomUUID(),user:{...user,aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()}});
});
app.get('/auth/v1/user',async(req,res)=>{const id=tokens.get(req.headers.authorization?.slice(7)||'');if(!id)return res.status(401).json({message:'Invalid token'});const r=await db.query<any>('select id,email from profiles where id=$1',[id]);res.json({...r.rows[0],aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{}});});
app.post('/auth/v1/logout',(_req,res)=>res.status(204).end());
app.get('/rest/v1/profiles',async(req,res)=>{
 const token=req.headers.authorization?.slice(7)||'',id=tokens.get(token),isService=token==='local-test-service';if(!id&&!isService)return res.status(401).json({message:'Sign in'});
 const filters:string[]=[],args:any[]=[];
 for(const [k,v]of Object.entries(req.query))if(['id','email','role','username','lrn'].includes(k)&&typeof v==='string'&&v.startsWith('eq.')){args.push(v.slice(3));filters.push(`${k}=$${args.length}`);}
 if(!isService){args.push(id);filters.push(`id=$${args.length}`);}
 const r=await db.query<any>('select id,email,display_name,role,status,grade_level,school_name,section,lrn,username,class_code,teacher_id,created_at from profiles'+(filters.length?' where '+filters.join(' and '):'')+' limit 2',args);
 res.json(req.headers.accept?.includes('vnd.pgrst.object')?r.rows[0]||null:r.rows);
});
// Serialize SET ROLE/claim scopes: PGlite is a single PostgreSQL connection.
let queue=Promise.resolve();function serial<T>(fn:()=>Promise<T>):Promise<T>{const next=queue.then(fn,fn);queue=next.then(()=>{},()=>{});return next;}
app.post('/rest/v1/rpc/:name',async(req,res)=>{
 const id=tokens.get(req.headers.authorization?.slice(7)||'');if(!id)return res.status(401).json({message:'Sign in'});
 const names=['privacy_grade_board','privacy_set_board_visibility','privacy_individual_report','privacy_admin_summary','privacy_bootstrap'];if(!names.includes(req.params.name))return res.status(403).json({message:'Not available'});
 try{const namesArgs:Record<string,string[]>={privacy_grade_board:['p_grade'],privacy_set_board_visibility:['p_visible'],privacy_individual_report:['p_student'],privacy_admin_summary:[],privacy_bootstrap:[]};const keys=namesArgs[req.params.name];if(Object.keys(req.body).some(k=>!keys.includes(k)))throw Error('Invalid arguments');
 const values=keys.filter(k=>k in req.body).map(k=>req.body[k]);const result=await serial(()=>asUser(db,id,async()=>{const r=await db.query<any>(`select public.${req.params.name}(${values.map((_,i)=>'$'+(i+1)).join(',')}) as data`,values);return r.rows[0].data;}));res.json(result);
 }catch{res.status(403).json({message:'Record is not available',code:'42501'});}
});
app.get('/rest/v1/student_progress',async(req,res)=>{
 const id=tokens.get(req.headers.authorization?.slice(7)||'');if(!id)return res.status(401).json({message:'Sign in'});
 try{const r=await serial(()=>asUser(db,id,()=>db.query('select user_id,xp,badges,completed_quests,progress_by_module from student_progress where user_id=$1',[id])));res.json(r.rows);}catch{res.status(403).json({message:'Not available'});}
});
app.post('/api/privacy',(req,res)=>void privacyHandler(req,res));app.post('/api/account-login',(req,res)=>void loginHandler(req,res));
app.use('/api',(_req,res)=>res.status(410).json({error:'Legacy endpoint retired in privacy review.'}));
const vite=await createServer({server:{middlewareMode:true,hmr:false},appType:'spa'});app.use(vite.middlewares);
app.listen(port,'127.0.0.1',()=>console.log(`Local privacy review: ${origin}. Synthetic fixtures only; no production connection.`));
