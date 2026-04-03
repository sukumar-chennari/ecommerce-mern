import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/response.util";
import { generateAccessToken } from "../utils/jwt";

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


interface JwtPayload {
  userId: string;
  role: "user" | "admin";
}

interface AuthRequest extends Request {
  userId?: string;
  role?: "user" | "admin";
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  const refreshToken = req.cookies?.refreshToken;

  // ❌ no tokens at all
  if (!accessToken && !refreshToken) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // ✅ Try access token first
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.userId = decoded.userId;
    req.role = decoded.role;

    return next();
  } catch (err: any) {
    // 🔥 Access token expired → try refresh
    if (!refreshToken) {
      return res.status(401).json({ message: "Session expired" });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as JwtPayload;

      // 🔥 generate new access token
      const newAccessToken = generateAccessToken(
        decoded.userId,
        decoded.role
      );

      // 🔥 set new cookie
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      req.userId = decoded.userId;
      req.role = decoded.role;

      return next();
    } catch {
      return res.status(401).json({ message: "Invalid session" });
    }
  }
};
// export const requireAuth = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const token = req.cookies?.accessToken;

//     if (!token) {
//       return res.status(401).json({ message: "Not authenticated" });
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET!
//     ) as JwtPayload;

//     req.userId = decoded.userId;
//     req.role = decoded.role;

//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };

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