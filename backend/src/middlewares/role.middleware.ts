import type { Request, Response, NextFunction } from "express";
import User from "../models/User.model.ts";

export const requireAdmin = async (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const user = await User.findById(req.userId);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};