// import { env } from "../configs/env";
import { OAuth2Client } from "google-auth-library";
import { CustomError } from "./CustomError.js";
import dotenv from "dotenv"

dotenv.config()

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token: string) => {
  if (!token) {
    throw new CustomError(400, "Google token is required");
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new CustomError(401, "Invalid Google token");
  }

  if (!payload) {
    throw new CustomError(401, "Google token verification failed, No payload received");
  }

  return payload;
};