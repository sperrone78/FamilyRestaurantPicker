import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const verifyAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No authentication token provided',
          code: 'UNAUTHORIZED'
        }
      });
    }

    const token = authHeader.substring(7);
    
    const decodedToken = await getAuth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid authentication token',
        code: 'UNAUTHORIZED'
      }
    });
  }
};