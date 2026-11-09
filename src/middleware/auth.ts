import type {Request,Response,NextFunction} from 'express';
import {createClient} from '@supabase/supabase-js';
export interface AuthRequest extends Request { user?:{uid:string;email?:string;role?:string} }
// Legacy locally minted sessions are no longer accepted as proof of identity.
export const requireAuth=async(req:AuthRequest,res:Response,next:NextFunction)=>{
 const token=/^Bearer (\S+)$/i.exec(req.headers.authorization||'')?.[1];
 if(!token||token.startsWith('lq_sess_'))return res.status(401).json({error:'Please sign in.'});
 const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_ANON_KEY||process.env.VITE_SUPABASE_ANON_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return res.status(503).json({error:'Private access is not configured.'});
 try{const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});const {data,error}=await client.auth.getUser(token);
 if(error||!data.user)return res.status(401).json({error:'Please sign in again.'});req.user={uid:data.user.id,email:data.user.email};next();
 }catch{return res.status(401).json({error:'Please sign in again.'});}
};
