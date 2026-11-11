import { NOTICE_VERSION } from '../data/legalNotices';
import { createSignupClient, supabase } from '../lib/supabase';
import { profileAccount } from './privacyService';

type StudentRegistration = {
  role: 'student';
  lrn: string;
  gradeLevel: number;
  section?: string;
  classCode: string;
};
type TeacherRegistration = { role: 'teacher'; employeeId: string };

export async function submitRegistration(input: (StudentRegistration | TeacherRegistration) & {
  name: string;
  schoolName: string;
  username: string;
  email: string;
  password: string;
}) {
  const { email, password, ...application } = input;
  if (password.length < 6) throw new Error('Use a password of at least 6 characters.');
  const { data, error } = await createSignupClient().auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: application.name,
        lingoquest_registration: { ...application, noticeVersion: NOTICE_VERSION, termsAccepted: true },
      },
    },
  });
  if (error?.code === 'unexpected_failure') {
    throw new Error(input.role === 'student'
      ? 'Registration could not be saved. Check your class code, learner number, and username.'
      : 'Registration could not be saved. Check your details and try a different username.');
  }
  if (error) throw error;
  if (!data.user || data.user.identities?.length === 0) {
    throw new Error('If you have already registered, sign in or use Forgot Password.');
  }
  return { needsEmailConfirmation: !data.session };
}

export async function loadRegistrationQueue() {
  if (!supabase) throw new Error('The approval queue is unavailable.');
  const { data, error } = await supabase.rpc('registration_queue');
  if (error) throw new Error('Could not load the approval queue. Please try again.');
  return (data as Parameters<typeof profileAccount>[0][]).map(profileAccount);
}

export async function saveRegistrationReview(
  id: string,
  decision: 'approve' | 'reject',
  options: { classCode?: string; note?: string; edits?: object } = {},
) {
  if (!supabase) throw new Error('The approval queue is unavailable.');
  const { error } = await supabase.rpc('review_registration', {
    p_id: id,
    p_decision: decision,
    p_class_code: options.classCode ?? null,
    p_edits: options.edits ?? {},
    p_note: options.note ?? null,
  });
  if (error) {
    const friendly = ['Invalid class code', 'Class code unavailable', 'Invalid student details', 'Learner number unavailable'];
    throw new Error(friendly.includes(error.message) ? error.message : 'Could not save this review. Refresh the queue and try again.');
  }
}
