import React from 'react';
export type RegistrationIdentity={firstName:string;lastName:string;middleName:string;contactNumber:string};
export function RegistrationIdentityFields({role,value,onChange}:{role:'student'|'teacher';value:RegistrationIdentity;onChange:(value:RegistrationIdentity)=>void}) {
 const fields=[['firstName','First Name','given-name'],['lastName','Last Name','family-name'],['middleName','Middle Name','additional-name'],['contactNumber','Contact Number','tel']] as const;
 return <fieldset className="col-span-full grid grid-cols-1 gap-3 sm:grid-cols-2"><legend className="sr-only">{role==='student'?'Student':'Teacher'} name and contact details</legend>
  {fields.map(([key,label,autoComplete])=><div key={key}>
   <label htmlFor={`${role}-${key}`} className="mb-1 block text-xs font-bold text-slate-300">{label} {key==='firstName'||key==='lastName'?<span className="text-rose-400">*</span>:<span className="font-normal text-slate-400">(Optional)</span>}</label>
   <input id={`${role}-${key}`} name={key} type={key==='contactNumber'?'tel':'text'} autoComplete={autoComplete} required={key==='firstName'||key==='lastName'} maxLength={key==='contactNumber'?25:50}
    value={value[key]} onChange={event=>onChange({...value,[key]:event.target.value})}
    aria-describedby={key==='contactNumber'?`${role}-contact-help`:undefined}
    className="w-full rounded-xl border border-[#193B66] bg-[#07172C] px-3.5 py-2 text-xs text-white outline-none focus:border-emerald-400"/>
  </div>)}
  <p id={`${role}-contact-help`} className="col-span-full text-[11px] leading-relaxed text-slate-400">Contact number is optional. Email is still used for account confirmation and password recovery; this number does not enable SMS sign-in or recovery.</p>
 </fieldset>;
}
