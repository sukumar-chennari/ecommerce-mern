import jwt from "jsonwebtoken";


export const generateAccessToken = (userId: string, role: "user" | "admin") => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string, role: "user" | "admin") => {
  return jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "7d",
  });
};