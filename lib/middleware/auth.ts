import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return {
      success: true,
      decoded
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid token'
    };
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookies = request.cookies;
  const tokenFromCookie = cookies.get('token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  return null;
}

export function authenticateToken(request: NextRequest) {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return {
      success: false,
      error: 'No token provided'
    };
  }

  return verifyToken(token);
}
