import type { Request, Response } from "express";
import { z } from "zod";
import User from "../models/User.model";
import { hashPassword, comparePassword } from "../services/auth.service";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
export const register = async (req: Request, res: Response) => {
  try {
    const registerSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email format"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    });

    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
    });

    return res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const loginSchema = z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required"),
    });

    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parsed.error.flatten(),
      });
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // Pass role to token generation
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ message: "Logged in", user });
  } catch (err) {
    console.error('error', err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.json({ message: "Logged out" });
};


export const refreshToken = (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { userId: string, role: "user" | "admin" };

    const newAccessToken = generateAccessToken(decoded.userId, decoded.role);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ message: "Token refreshed" });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};


export const getCurrentUser = async (req: any, res: Response) => {
  try {
    console.log('req.userId', req.userId);
    console.log('req.role', req.role);
    console.log('Fetching current user', req);
    const user = await User.findById(req.userId).select("-password");
    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};