import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return {
      success: true,
      decoded
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    };
  }
}

export function getTokenFromRequest(request: AuthenticatedRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const tokenFromCookie = request.cookies?.token;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  return null;
}

export function authenticateToken(request: AuthenticatedRequest) {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return {
      success: false,
      error: 'No token provided'
    };
  }

  return verifyToken(token);
}

/**
 * Express middleware for JWT authentication
 */
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const result = authenticateToken(req);
  
  if (!result.success) {
    return res.status(401).json({
      success: false,
      message: result.error || 'Authentication failed'
    });
  }

  req.user = result.decoded;
  next();
};

/**
 * Middleware to check if user has specific role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'User does not have permission to access this resource'
      });
    }

    next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

/**
 * Middleware to require interviewer role
 */
export const requireInterviewer = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  if (req.user.role !== 'interviewer' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Interviewer access required'
    });
  }

  next();
};

/**
 * Middleware to skip authentication (optional auth)
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const result = authenticateToken(req);
  
  if (result.success) {
    req.user = result.decoded;
  }

  next();
};

export default authenticate;
