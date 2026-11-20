import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {RegistrationIdentityFields} from '../src/components/RegistrationIdentityFields';
import {normalizeRegistrationIdentity as normalize} from '../src/utils/registrationIdentity';
test('normalizes separate names and an optional international contact without losing accents',()=>{
 assert.deepEqual(normalize({firstName:'  María  Ana ',lastName:"Dela Cruz",middleName:'Reyes',contactNumber:'+63 (917) 123-4567'}),{firstName:'María Ana',lastName:'Dela Cruz',middleName:'Reyes',contactNumber:'+639171234567',name:'María Ana Reyes Dela Cruz'});
 assert.equal(normalize({firstName:'Alex',lastName:'Lee'}).name,'Alex Lee');
});
test('rejects missing names, invalid contact and oversized display names',()=>{
 for(const x of [{firstName:' ',lastName:'Lee'},{firstName:'Alex',lastName:''},{firstName:'Alex',lastName:'Lee',contactNumber:'hello'},{firstName:'a'.repeat(50),middleName:'b'.repeat(50),lastName:'c'.repeat(50)}]) assert.throws(()=>normalize(x));
});
test('both registration roles expose linked labels, optional middle name and phone',()=>{
 for(const role of ['student','teacher'] as const){
  const html=renderToStaticMarkup(<RegistrationIdentityFields role={role} value={{firstName:'',lastName:'',middleName:'',contactNumber:''}} onChange={()=>{}}/>);
  for(const key of ['firstName','lastName','middleName','contactNumber'])assert.match(html,new RegExp(`for="${role}-${key}"`));
  assert.equal((html.match(/required=""/g)||[]).length,2);assert.match(html,/type="tel"/);assert.match(html,/does not enable SMS/);
 }
});
