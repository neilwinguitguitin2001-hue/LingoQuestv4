import assert from 'node:assert/strict';
import test from 'node:test';
import {validateOtpEmail,validateOtpCode,canOpenOtpPortal} from '../src/utils/emailOtpValidation';
test('email OTP normalizes address and requires an email, not a username or phone',()=>{
 assert.equal(validateOtpEmail(' Learner@Example.edu '),'learner@example.edu');
 for(const x of ['student.grade7','09171234567','x@','x y@example.edu','a'.repeat(201)+'@example.edu'])assert.throws(()=>validateOtpEmail(x));
});
test('OTP input preserves leading zeroes and rejects malformed tokens',()=>{
 assert.equal(validateOtpCode(' 001234 '),'001234');
 assert.equal(validateOtpCode('00123456'),'00123456');
 assert.equal(validateOtpCode('0012345678'),'0012345678');
 for(const x of ['12345','12345678901','123 456','abcdef',''])assert.throws(()=>validateOtpCode(x));
});
test('email verification cannot change portal role or bypass suspension and approval requirements',()=>{
 for(const role of ['student','teacher','admin'] as const){
  assert.equal(canOpenOtpPortal({role,status:'approved'},role),true);
  assert.equal(canOpenOtpPortal({role,status:'suspended'},role),false);
  assert.equal(canOpenOtpPortal({role:role==='student'?'teacher':'student',status:'approved'},role),false);
  assert.equal(canOpenOtpPortal(null,role),false);
  for(const status of ['pending','rejected']) assert.equal(canOpenOtpPortal({role,status},role),role!=='admin');
 }
});
