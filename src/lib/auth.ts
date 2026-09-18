import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'crackers_web_secret_key_2026';
const TOKEN_EXPIRY = '24h';
const COOKIE_NAME = 'admin_token';

export interface AdminPayload {
  id: number;
  name: string;
  role: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminFromCookie(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAdmin(handler: (req: Request, admin: AdminPayload) => Promise<Response>) {
  return async (req: Request) => {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const admin = verifyToken(token);
    if (!admin) {
      return Response.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }
    return handler(req, admin);
  };
}
