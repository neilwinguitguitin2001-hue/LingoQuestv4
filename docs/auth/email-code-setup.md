# Email-code preview setup

Password remains the default. Email OTP is an alternative passwordless sign-in, not an additional MFA factor. Login requests use shouldCreateUser:false. Registration retains a password and pending school approval; an email code verifies the email only. Optional phone contact is not a verified authentication phone.

## Shared Supabase setup required

Project hxkeomhutnkvtulqjbss → Authentication → Email Templates. Add the code below to both Confirm signup and Magic Link templates, retaining the current confirmation link and recovery templates. Existing production clients can still use the existing links. No recovery template or expiry change is required.

```html
<h2>Your LingoQuest verification code</h2>
<p>Enter this code only on LingoQuest:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>If you did not request this email, ignore it. Never share this code.</p>
```

Keep email confirmation enabled and SMTP configured. Do not put service-role keys or Resend keys in browser variables. The templates are shared with the live website, so this document does not claim they were applied. Native Supabase limits and token expiry/reuse checks enforce the code; the UI adds a60-second resend countdown. Six-digit token UI assumes the project's standard six-digit email OTP setting.

## Verification needed before release

Use an account with a real inbox controlled by the tester. Request a sign-in code, verify it, confirm the correct role/pending screen. Test wrong, expired, already-used and superseded codes, resend throttling, unknown email without account creation, suspended user denial and student/teacher/admin role mismatch. Complete a test signup with code confirmation and verify school approval is still pending. Confirm original password and recovery flows. No emails were sent to demo school addresses as part of development.

Browser access was unavailable for template configuration and live inbox tests. Keep preview unmerged until delivery is verified.
