import type { RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { CustomError } from "../utils/CustomError.js";
import { verifyGoogleToken } from "../utils/verifyGoogleToken.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createHash, generateAccessToken, generateRefreshToken } from "../utils/helper.js";
import ms, { type StringValue } from "ms";
import { generateCookieOptions } from "../config/cookies.js";
import { prisma } from "../config/db.js";


export const signup : RequestHandler = asyncHandler(async (req, res) => {
  const {email, password} = req.body;
  if(!email || !password){
    throw new CustomError(400, "Email and password are required");
  }

  let existingUser; 
  const user = await prisma.user.findUnique({
    where: { email },
  })
  existingUser = user;
  if(existingUser){
    throw new CustomError(400, "User already exists");
  }

  const newUser = await prisma.user.create({
    data: {
      email,
      username: email.split("@")[0],
      picture: "",
      password,
      balance: {
        usd: "10000",
        btc: "0",
        sol: "0",
        eth: "0"
      },
      orderHistory: 0,
      positions: []
    }
  });
  res.status(201).json(new ApiResponse(201, "User created successfully", newUser.id));

})

export const signin : RequestHandler = asyncHandler(async (req, res) => {
  const {email, password, rememberMe} = req.body;
  if(!email || !password){
    throw new CustomError(400, "Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if(!user || user.password !== password){
    throw new CustomError(400, "Invalid email or password");
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  const hashedRefreshToken = createHash(refreshToken);
  const expiresAt = new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY as StringValue));
  // put in db
  await prisma.user.update({
    where: { email },
    data: { refreshToken: hashedRefreshToken, refreshTokenExpiry: expiresAt }
  })
  res
    .status(200)
    .cookie("accessToken", accessToken, generateCookieOptions())
    .cookie("refreshToken", refreshToken, generateCookieOptions({ rememberMe }))
    .json(new ApiResponse(200, "Login successful", null));
})

export const googleLogin : RequestHandler= asyncHandler(async (req, res) => {
  const { token, rememberMe } = req.body;
  const payload = await verifyGoogleToken(token);

  const { email, name, picture } = payload;

  if (!email || !name || !picture) {
    throw new CustomError(200, "");
  }

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if( !user){
    user = await prisma.user.create({
      data: {
        email,
        username: name,
        picture,
        password: "",
        balance: {
          usd: "10000",
          btc: "0",
          sol: "0",
          eth: "0"
        },
        orderHistory: 0,
        positions: []
      }
    });
  }

 
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;

  const hashedRefreshToken = createHash(refreshToken);
  const expiresAt = new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY as StringValue));
  
  // put in db 

  res
    .status(200)
    .cookie("accessToken", accessToken, generateCookieOptions())
    .cookie("refreshToken", refreshToken, generateCookieOptions({ rememberMe }))
    .json(new ApiResponse(200, "Google login successful", null));
});