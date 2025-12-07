import  type { Request, Response } from "express";
import User from "../models/User.model.ts";
import { hashPassword, comparePassword } from "../services/auth.service.ts";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.ts";
import jwt from "jsonwebtoken";
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

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
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { userId: string };

    const newAccessToken = generateAccessToken(decoded.userId);

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
    const user = await User.findById(req.userId).select("-password");
    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};