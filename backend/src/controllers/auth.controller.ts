import type { Request, Response } from "express";
import { z } from "zod";
import User from "../models/User.model";
import { ApiResponse } from "../utils/response.util";
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
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    // ... rest of register logic
    const { name, email, password } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, "Email already exists", null, 400);
    }

    const hashed = await hashPassword(password);
    // ...
    const newUser = await User.create({
      name,
      email,
      password: hashed,
    });

    return ApiResponse.success(res, "User registered", { user: newUser }, 201);
  } catch (err) {
    return ApiResponse.error(res, "Server error", err);
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
      return ApiResponse.error(res, "Validation failed", parsed.error.flatten(), 400);
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) return ApiResponse.error(res, "Invalid credentials", null, 400);

    const match = await comparePassword(password, user.password);
    if (!match) return ApiResponse.error(res, "Invalid credentials", null, 400);

    // Pass role to token generation
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString(), user.role);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set true in prod
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return ApiResponse.success(res, "Logged in", { user });
  } catch (err) {
    console.error('error', err);
    return ApiResponse.error(res, "Server error", err);
  }
};


export const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return ApiResponse.success(res, "Logged out");
};


export const refreshToken = (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return ApiResponse.error(res, "No refresh token", null, 401);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { userId: string, role: "user" | "admin" };

    const newAccessToken = generateAccessToken(decoded.userId, decoded.role);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    return ApiResponse.success(res, "Token refreshed");
  } catch {
    return ApiResponse.error(res, "Invalid refresh token", null, 401);
  }
};


export const getCurrentUser = async (req: any, res: Response) => {
  try {
    console.log('req.userId', req.userId);
    console.log('req.role', req.role);
    console.log('Fetching current user', req);
    const user = await User.findById(req.userId).select("-password");

    return ApiResponse.success(res, "Current user retrieved", { user });
  } catch {
    return ApiResponse.error(res, "Server error", null, 500);
  }
};