import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AuthTokenPayload {
  uid: string;
  sub: string;
  email?: string;
  role?: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  auth_time: number;
}

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'lingoquest-deped-davao-oriental-cloudsql-secret';

export function createAppSessionToken(uid: string, email: string, role: string): string {
  const payload = JSON.stringify({
    uid,
    email,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
  });
  const base64Payload = Buffer.from(payload, 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');
  return `lq_sess_${base64Payload}.${signature}`;
}

function verifyAppSessionToken(token: string): AuthTokenPayload | null {
  if (!token.startsWith('lq_sess_')) return null;
  const raw = token.slice('lq_sess_'.length);
  const parts = raw.split('.');
  if (parts.length !== 2) return null;
  const [base64Payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return {
      uid: parsed.uid,
      sub: parsed.uid,
      email: parsed.email,
      role: parsed.role,
      aud: 'lingoquest',
      iss: 'lingoquest',
      iat: parsed.iat,
      exp: parsed.exp,
      auth_time: parsed.iat,
    };
  } catch {
    return null;
  }
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];

  const appSession = verifyAppSessionToken(token);
  if (appSession) {
    req.user = appSession;
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid token' });
};
