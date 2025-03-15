import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../lib/generateToken";
import { User } from "../types/user.type";
import { comparePassword, hashPassword } from "../lib/hashPassword";
import { createId } from "@paralleldrive/cuid2";
import { getEmailById, getUserByEmail } from "../models/user.model";
import {
  createRefreshToken,
  deleteRefreshToken,
  getUserByRefreshToken,
  getUserDataById,
  registerUser,
} from "../models/auth.model";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET as string;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET as string;

export const signUp = async (req: Request, res: Response) => {
  const { name, email, password, confPassword } = req.body as User;
  const id = createId();

  if (!name || !email || !password || !confPassword) {
    res
      .status(400)
      .json({ code: 400, success: false, error: "All fields are required" });
    return;
  }

  try {
    const users = await getUserByEmail(email);
    if (users?.email === email) {
      res
        .status(400)
        .json({ code: 400, success: false, message: "Email already exists" });
      return;
    }

    if (password !== confPassword) {
      res.status(400).json({
        code: 400,
        success: false,
        message: "Password does not match",
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await registerUser(id, name, email, hashedPassword);
    res.status(201).json({
      code: 201,
      success: true,
      message: "User created successfully",
      data: user,
    });
    return;
  } catch (error) {
    res.status(500).json({
      code: 500,
      success: false,
      error: "Database error",
      data: error,
    });
  }
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    //find user by email
    const user = await getUserByEmail(email);

    if (!user) {
      res
        .status(404)
        .json({ code: 404, success: false, message: "User not found" });
      return;
    }

    // Cek apakah password benar
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res
        .status(401)
        .json({ code: 401, success: false, message: "Wrong Password" });
      return;
    }

    //generate accessToken dan refreshToken JWT
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    //masukan refresh token ke database
    await createRefreshToken(user.id, refreshToken);

    //kirim refresh token ke client
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    //kirim response berupa accessToken dan user data
    res.json({
      code: 200,
      success: true,
      message: "Login successful",
      accessToken,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, success: false, error: "Database error" });
    return;
  }
};

export const me = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token || !SECRET_KEY) {
    res.status(401).json({ error: "Invalid token or secret key" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { data: string };
    const user = await getUserDataById(decoded.data);

    if (!user) {
      res
        .status(404)
        .json({ code: 404, success: false, error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    console.error("JWT Error:", error.message);
    return;
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ error: "No refresh token provided" });
    return;
  }

  try {
    // Cek apakah refresh token ada di database
    const user = await getUserByRefreshToken(refreshToken);

    if (!user) {
      res
        .status(403)
        .json({ code: 403, success: false, error: "Invalid refresh token" });
      return;
    }

    // Verifikasi refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as {
      id: string;
    };

    if (decoded.id !== user.id) {
      res
        .status(403)
        .json({ code: 403, success: false, error: "Invalid refresh token" });
      return;
    }

    // Generate access token baru
    const newAccessToken = generateAccessToken(user.id);

    // Kirim response dengan access token baru
    res
      .status(200)
      .json({ code: 200, success: true, accessToken: newAccessToken });
    return;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res
      .status(403)
      .json({ code: 403, success: false, error: "Invalid refresh token" });
    return;
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res
      .status(400)
      .json({ code: 400, success: false, error: "No refresh token provided" });
    return;
  }

  try {
    //delete refresh token from database
    await deleteRefreshToken(refreshToken);

    //delete refresh token from cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res
      .status(200)
      .json({ code: 200, success: true, message: "Logged out successfully" });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ code: 500, success: false, error: "Database error" });
    return;
  }
};
