import type { Request, RequestHandler } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { CustomError } from "../utils/CustomError.js";
import { verifyGoogleToken } from "../utils/verifyGoogleToken.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createHash,
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  passwordMatch,
} from "../utils/helper.js";
import ms, { type StringValue } from "ms";
import { generateCookieOptions } from "../config/cookies.js";
import { prisma } from "../config/db.js";

export const signup: RequestHandler = asyncHandler(async (req, res) => {
  console.log("req.body", req.body);
  const { email, password } = req.body;
  console.log("email, password", email, password);
  if (!email || !password) throw new CustomError(400, "Email and password are required");
  
  let existingUser;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  existingUser = user;
  if (existingUser)  throw new CustomError(400, "User already exists");
  
  const passwordHash = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      email,
      username: email.split("@")[0],
      picture: "https://avatar.iran.liara.run/public",
      passwordHash,
      balance:5000
    },
  });
  res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", newUser.id));
});

export const signin: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  if (!email || !password) {
    throw new CustomError(400, "Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if(!user){
    throw new CustomError(400, "Invalid email or password");
  }

  const isPasswordValid = await passwordMatch(password, user.passwordHash!);
  if (!isPasswordValid) {
    throw new CustomError(400, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const hashedRefreshToken = createHash(refreshToken);
  const expiresAt = new Date(
    Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY as StringValue)
  );
  const updatedUser = await prisma.user.update({
    where: { email },
    data: { refreshToken: hashedRefreshToken, refreshTokenExpiry: expiresAt },
  });
  res
    .status(200)
    .cookie("accessToken", accessToken, generateCookieOptions())
    .cookie("refreshToken", refreshToken, generateCookieOptions({ rememberMe }))
    .json(new ApiResponse(200, "Login successful", updatedUser));
});

export const googleLogin: RequestHandler = asyncHandler(async (req, res) => {
  const { token, rememberMe } = req.body;
  const payload = await verifyGoogleToken(token);

  const { email, name, picture } = payload;

  if (!email || !name || !picture) {
    throw new CustomError(200, "");
  }

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        username: name,
        picture,
        passwordHash: "",
        balance: 5000
      },
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;

  const hashedRefreshToken = createHash(refreshToken);
  const expiresAt = new Date(
    Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRY as StringValue)
  );

  // put in db
  await prisma.user.update({
    where: { email },
    data: { refreshToken: hashedRefreshToken, refreshTokenExpiry: expiresAt },
  });

  res
    .status(200)
    .cookie("accessToken", accessToken, generateCookieOptions())
    .cookie("refreshToken", refreshToken, generateCookieOptions({ rememberMe }))
    .json(new ApiResponse(200, "Google login successful", null));
});

export const signout: RequestHandler = asyncHandler(async(req, res)=>{
  const userId = req.user.id;

  if(!userId)throw new CustomError(401, "Not authorized");

  await prisma.user.update({
    where: {id: userId},
    data: {
      refreshToken: null, refreshTokenExpiry: null
    }
  })

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json(new ApiResponse(200, "Signout successful", null));

})

export const getUser: RequestHandler = asyncHandler(async (req:Request, res) =>{
  const userId = req.user.id;
  if(!userId) throw new CustomError(400, "user not found ")

  try {
    const user = await prisma.user.findFirst({
      where: {id: req.user.id}
    })

    if(!user) throw new CustomError(404, "User not found");

    res.status(200).json(new ApiResponse(200, "User fetched", user));
  } catch (error) {
    throw new CustomError(401, "User can be fetched");
  }
})