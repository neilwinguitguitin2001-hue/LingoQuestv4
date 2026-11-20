export function validateOtpEmail(email:string){
 const value=email.trim().toLowerCase();
 if(value.length>200||!/^\S+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error('Enter the email registered with your account.');
 return value;
}
export function validateOtpCode(code:string){
 const value=code.trim();
 if(!/^[0-9]{6,10}$/.test(value))throw new Error('Enter the 6–10 digit code from your email.');
 return value;
}
export function canOpenOtpPortal(profile:{role:string;status:string}|null,role:'student'|'teacher'|'admin'){
 return !!profile && profile.role===role && (profile.status==='approved'||(role!=='admin'&&['pending','rejected'].includes(profile.status)));
}
