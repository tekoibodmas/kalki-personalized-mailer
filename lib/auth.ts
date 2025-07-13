import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.SESSION_SECRET || 'fallback-secret-key-for-development';
const key = new TextEncoder().encode(secretKey);

export interface User {
  email: string;
  expiryDate: string;
}

export async function encrypt(payload: { user: User | null; expires: Date }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function decrypt(input: string): Promise<{ user: User | null; expires: Date } | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as { user: User | null; expires: Date };
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

export async function setUser(user: User | null) {
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const session = await encrypt({ user, expires });

  cookies().set('session', session, { expires, httpOnly: true });
}

export async function getUser(): Promise<User | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  const decrypted = await decrypt(sessionCookie);
  if (!decrypted) return null;
  
  // Check if session is expired
  if (new Date(decrypted.expires) < new Date()) {
    return null;
  }

  return decrypted.user;
}
