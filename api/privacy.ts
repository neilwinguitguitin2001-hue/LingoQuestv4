import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { privacyAction } from '../src/server/privacyActions.js';

export default async function handler(req: IncomingMessage & {body?: unknown}, res: ServerResponse) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Vary','Authorization');
  const send=(status:number,body:unknown)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(body));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{error:'Use POST.'});}
  const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)return send(503,{error:'Private access is not configured.'});
  try {
    let body=req.body;
    if(body===undefined){let text='';for await(const c of req){text+=c;if(Buffer.byteLength(text)>12000)return send(413,{error:'Request too large.'});}body=JSON.parse(text);}
    if(typeof body==='string'){if(Buffer.byteLength(body)>12000)return send(413,{error:'Request too large.'});body=JSON.parse(body);}
    const token=/^Bearer (\S+)$/i.exec(req.headers.authorization||'')?.[1];
    if(!token)return send(401,{error:'Please sign in.'});
    const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`},fetch:(i,o)=>fetch(i,{...o,signal:AbortSignal.timeout(8000)})}});
    const {data,error}=await client.auth.getUser(token);
    if(error||!data.user)return send(401,{error:'Please sign in again.'});
    const result=await privacyAction(body,async(name,args)=>{
      const {data,error}=await client.rpc(name,args);
      if(error)throw new Error('Record is not available.');
      return data;
    });
    return send(200,result);
  }catch{return send(403,{error:'This request is not available for your account.'});}
}
