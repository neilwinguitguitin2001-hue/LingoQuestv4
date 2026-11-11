import type { IncomingMessage,ServerResponse } from 'node:http';
import {createClient} from '@supabase/supabase-js';
const attempts=new Map<string,{until:number;count:number}>();
export default async function handler(req:IncomingMessage & {body?:any},res:ServerResponse){
 res.setHeader('Cache-Control','no-store');
 const send=(code:number,body:unknown)=>{res.statusCode=code;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));};
 if(req.method!=='POST')return send(405,{error:'Use POST.'});
 try{
  let b=req.body;if(b===undefined){let text='';for await(const c of req){text+=c;if(text.length>4096)return send(413,{error:'Request too large.'});}b=JSON.parse(text);}if(typeof b==='string')b=JSON.parse(b);
  if(typeof b?.identifier!=='string'||b.identifier.length>200||typeof b.password!=='string'||b.password.length>200||!['student','teacher','admin'].includes(b.role))return send(401,{error:'Incorrect account or password.'});
  const ip=String(req.headers['x-real-ip']||req.socket?.remoteAddress||'unknown');const now=Date.now();for(const[k,v]of attempts)if(v.until<=now)attempts.delete(k);
  const entry=attempts.get(ip)||{until:now+60000,count:0};if(entry.count>=8||attempts.size>=5000)return send(429,{error:'Please wait before trying again.'});entry.count++;attempts.set(ip,entry);
  const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
  if(!url||!key||!secret)return send(503,{error:'Account sign-in is not configured.'});
  const options={auth:{persistSession:false,autoRefreshToken:false}};
  const admin=createClient(url,secret,options);const id=b.identifier.trim().toLowerCase();
  // Parameterized equality, no client-supplied filter expressions or public identifier directory.
  let q=admin.from('profiles').select('id,email,role,status').eq('role',b.role);
  q=id.includes('@')?q.eq('email',id):/^\d{12}$/.test(id)?q.eq('lrn',id):q.eq('username',id);
  const {data:rows,error}=await q.limit(2);const p=!error&&rows?.length===1?rows[0]:null;
  const client=createClient(url,key,options);
  // Uniform outward error; no profile data or existence response before password verification.
  const {data,error:authError}=await client.auth.signInWithPassword({email:p?.email||'unavailable-account@example.invalid',password:b.password});
  if(p && authError?.code==='email_not_confirmed')return send(401,{error:'Confirm your email using the link sent when you registered.'});
  const canSignIn=p&&(p.status==='approved'||(p.role!=='admin'&&['pending','rejected'].includes(p.status)));
  if(!canSignIn||authError||data.user?.id!==p.id||!data.session)return send(401,{error:'Incorrect account or password.'});
  return send(200,{session:{access_token:data.session.access_token,refresh_token:data.session.refresh_token}});
 }catch{return send(401,{error:'Incorrect account or password.'});}
}
