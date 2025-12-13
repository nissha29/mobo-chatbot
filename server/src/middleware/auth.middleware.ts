import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    phone: string;
    email: string;
  };
}

export const authenticateUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ 
        message: "Access denied. No token provided.",
        error: "UNAUTHORIZED" 
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || "12345";
    
    jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({ 
          message: "Invalid or expired token.",
          error: "FORBIDDEN" 
        });
        return;
      }

      req.user = decoded as { userId: string; phone: string; email: string };
      next();
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Authentication error.",
      error: "INTERNAL_ERROR" 
    });
  }
};

