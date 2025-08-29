import bcrypt from "bcrypt"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import type { StringValue } from "ms";
import crypto from "crypto"

dotenv.config()

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10);

export const passwordMatch = async (enteredPassword: string, storedPassword: string) =>
  bcrypt.compare(enteredPassword, storedPassword);

export const generateAccessToken = (user: any) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as StringValue },
  );

export const generateRefreshToken = (user: any) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as StringValue },
  );

export const createHash = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateToken = () => {
  const unHashedToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = createHash(unHashedToken);
  const tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

  return { unHashedToken, hashedToken, tokenExpiry };
};