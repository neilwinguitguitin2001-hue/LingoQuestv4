import {createSignupClient, supabase} from '../lib/supabase';
import {privateBootstrap} from './privacyService';
import {validateOtpEmail, validateOtpCode, canOpenOtpPortal} from '../utils/emailOtpValidation';
export type OtpPurpose='login'|'registration';
export async function requestEmailCode(email:string,purpose:OtpPurpose){
 const client=createSignupClient(),address=validateOtpEmail(email);
 const {error}=purpose==='registration'
  ? await client.auth.resend({type:'signup',email:address,options:{emailRedirectTo:window.location.origin}})
  : await client.auth.signInWithOtp({email:address,options:{shouldCreateUser:false,emailRedirectTo:window.location.origin}});
 if(error && !['user_not_found','signup_disabled','otp_disabled'].includes(error.code || '')) throw new Error('The code request could not finish. Wait a minute and try again.');
 // Never disclose whether an address has an account. Supabase enforces its own delivery limits.
}
export async function verifyEmailCode(email:string,code:string,purpose:OtpPurpose,role:'student'|'teacher'|'admin'){
 const client=createSignupClient();
 const {data,error}=await client.auth.verifyOtp({email:validateOtpEmail(email),token:validateOtpCode(code),type:purpose==='registration'?'signup':'email'});
 if(error||!data.user||!data.session) throw new Error('This code is invalid or expired. Check the code or request another.');
 if(purpose==='registration'){
  await client.auth.signOut({scope:'local'});
  return null;
 }
 if(!supabase)throw new Error('Sign-in is unavailable.');
 // Check the verified identity and selected role before installing a persistent browser session.
 const {data:profile,error:profileError}=await client.from('profiles').select('id,role,status').eq('id',data.user.id).maybeSingle();
 const allowed=canOpenOtpPortal(profile,role);
 if(profileError||!allowed){await client.auth.signOut({scope:'local'});throw new Error('This account is unavailable for the selected portal. Check your role or contact your school.');}
 const {error:sessionError}=await supabase.auth.setSession({access_token:data.session.access_token,refresh_token:data.session.refresh_token});
 if(sessionError)throw new Error('Sign-in could not be completed. Please try again.');
 try{
  const boot=await privateBootstrap();const own=boot.users.find(user=>user.id===data.user!.id);
  if(!own||own.role!==role)throw new Error('Account is unavailable.');
  return own;
 }catch{
  const {data:current}=await supabase.auth.getSession();
  if(current.session?.user.id===data.user.id)await supabase.auth.signOut({scope:'local'});
  throw new Error('Your account could not be opened. Please try again or contact your school.');
 }
}
