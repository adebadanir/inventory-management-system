import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { db } from "../config/db";
import { User } from "../models/user.model";
import { comparePassword, hashPassword } from "../lib/hashPassword";
import { createId } from "@paralleldrive/cuid2";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET as string;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET as string;

const generateAccessToken = (id: string) => {
  const token = jwt.sign(
    {
      data: id,
    },
    SECRET_KEY,
    {
      expiresIn: "15m",
    }
  );
  return token;
};

const generateRefreshToken = (id: string) => {
  const token = jwt.sign(
    {
      data: id,
    },
    REFRESH_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  return token;
};

export const signUp = async (req: Request, res: Response) => {
  const { name, email, password, confPassword } = req.body as User;
  const id = createId();

  if (!name || !email || !password || !confPassword) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const [existingUsers] = await db.query(
      "SELECT email FROM users WHERE email = ? AND deleted_at IS NULL",
      [email]
    );

    if ((existingUsers as any[]).length > 0) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    await db.query(
      "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
      [id, name, email, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Database error" });
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
    const [users] = await db.query(
      "SELECT id, email, password  FROM users WHERE email = ? AND deleted_at IS NULL",
      [email]
    );
    const user = (users as any[])[0];
    //cek apakah password sama dengan yang disimpan di database
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Cek apakah password benar
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Wrong Password" });
      return;
    }

    //generate accessToken dan refreshToken JWT
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    //masukan refresh token ke database
    await db.query("UPDATE users SET refresh_token = ? WHERE id = ?", [
      refreshToken,
      user.id,
    ]);

    //kirim refresh token ke client
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    //kirim response berupa accessToken dan user data
    res.json({
      message: "Login successful",
      accessToken,
    });
    return;
  } catch (error) {
    res.status(500).json({ error: "Database error" });
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
    const [users] = await db.query(
      "SELECT id, name, email, avatar, role FROM users WHERE id = ? AND deleted_at IS NULL",
      [decoded.data]
    );
    const user = (users as any[])[0];

    if (!user) {
      res.status(404).json({ error: "User not found" });
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
    const [users] = await db.query(
      "SELECT id FROM users WHERE refresh_token = ?",
      [refreshToken]
    );
    const user = (users as any[])[0];

    if (!user) {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    // Verifikasi refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as {
      id: string;
    };

    if (decoded.id !== user.id) {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    // Generate access token baru
    const newAccessToken = generateAccessToken(user.id);

    // Kirim response dengan access token baru
    res.json({ accessToken: newAccessToken });
    return;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    res.status(403).json({ error: "Invalid refresh token" });
    return;
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(400).json({ error: "No refresh token provided" });
    return;
  }

  try {
    //delete refresh token from database
    await db.query(
      "UPDATE users SET refresh_token = NULL WHERE refresh_token = ?",
      [refreshToken]
    );
    //delete refresh token from cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.json({ message: "Logged out successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Database error" });
    return;
  }
};
