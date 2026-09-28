import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_and_make_sure_it_is_long_enough_to_be_secure_256_bits';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Access token required.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Invalid or expired token.',
    });
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Authentication required.',
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `Forbidden. Action requires ${role} privileges.`,
      });
    }

    next();
  };
}
