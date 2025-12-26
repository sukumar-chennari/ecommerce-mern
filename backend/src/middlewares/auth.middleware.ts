import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  role: "user" | "admin";
}

interface AuthRequest extends Request {
  userId?: string;
  role?: "user" | "admin";
}

/**
 * Require user to be authenticated
 */
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Require admin role
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};