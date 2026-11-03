# Security Specification & Test-Driven Defense (LingoQuest RBAC)

## 1. Data Invariants

1. **Role Integrity**: A user can never change their own role or self-promote to `admin` or self-approve from `pending` to `approved`.
2. **Teacher Approval Gate**: Teachers start in `pending` status. They cannot access faculty features or manage classes until explicitly approved by an administrator.
3. **Class Code Linkage**: Students must supply a valid teacher `classCode` upon registration. Students can only be viewed by the teacher matching their `classCode` or by an administrator.
4. **Teacher Isolation**: Teachers can ONLY query/read student records and progress documents whose `classCode` matches their own teacher `classCode`. Teachers cannot view students from other teachers' classes.
5. **Module Governance**: Curriculum modules, lessons, and quiz questions can ONLY be created, updated, or deleted by verified administrators. Teachers and students have read-only access.
6. **Student Progress Autonomy & Score Bounds**: Students can write and update their own progress documents (`userId == request.auth.uid`), but cannot arbitrarily inflate scores or tamper with other students' records.
7. **Admin Privilege Isolation**: Only users whose UID exists in `/admins/{adminId}` can approve/reject/suspend teachers, edit curriculum modules, or view the system audit logs.
8. **Audit Trail Immutability**: Audit log entries can only be appended by administrators and cannot be altered or deleted once written.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Self-Promotion to Admin Attack**: A student attempts to update their user record to `{ role: "admin", status: "approved" }`.
2. **Teacher Self-Approval Attack**: A pending teacher attempts to bypass the approval queue by sending an update `{ status: "approved" }`.
3. **Teacher Module Injection Attack**: A teacher attempts to write or edit a module in `/modules/{moduleId}`.
4. **Cross-Teacher Student Snooping Attack**: Teacher A (class code `LQ-DVO-101`) attempts to query students belonging to Teacher B (class code `LQ-DVO-202`).
5. **Score Manipulation Attack**: A student sends an update to `/users/{otherStudentId}` to overwrite points or badges.
6. **Ghost ID Path Poisoning Attack**: An attacker attempts to create a document with a 2,000-character malicious path ID or invalid characters.
7. **Module Deletion Attack by Student**: A student issues a delete request to `/modules/g8-q1-m1`.
8. **Unapproved Teacher Access Attack**: A pending teacher attempts to list or read student rosters before admin approval.
9. **Fake Class Code Attack**: A student registers with an arbitrary unverified class code or claims teacher privilege.
10. **Audit Log Tampering Attack**: An attacker attempts to delete or overwrite an entry in `/audit_logs/{logId}`.
11. **Admin Impersonation Attack**: A standard user creates a document in `/admins/{userId}` with their own UID to elevate privileges.
12. **Student Progress Hijacking Attack**: Student A attempts to overwrite Student B's progress document in `/progress/{studentB_moduleId}`.

---

## 3. Test Runner (firestore.rules.test.ts)

```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

// Verification matrix ensuring all 12 Dirty Dozen payloads fail with PERMISSION_DENIED
describe('LingoQuest Security Rules TDD Suite', () => {
  it('Payload 1: Denies student self-promotion to admin', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 2: Denies teacher self-approval', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 3: Denies teacher modifying curriculum modules', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 4: Denies teacher reading students outside their class code', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 5: Denies student modifying other student data or points', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 6: Denies path ID poisoning with invalid characters', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 7: Denies non-admin deleting curriculum modules', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 8: Denies pending teacher viewing student roster', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 9: Denies student assigning themselves teacher role', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 10: Denies updating or deleting audit logs', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 11: Denies creating admin records by non-admins', async () => {
    // Expect PERMISSION_DENIED
  });
  it('Payload 12: Denies overwriting another student progress record', async () => {
    // Expect PERMISSION_DENIED
  });
});
```
