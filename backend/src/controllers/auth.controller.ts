import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { User } from "../types/user.type";
import { comparePassword, hashPassword } from "../utils/hashPassword";
import { createId } from "@paralleldrive/cuid2";
import { getUserByEmail } from "../models/user.model";
import {
  createRefreshToken,
  deleteRefreshToken,
  getUserDataById,
  registerUser,
} from "../models/auth.model";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET as string;
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET as string;

export const signUpController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, confPassword } = req.body as User;
  const id = createId();

  if (!name || !email || !password || !confPassword) {
    res;
    throw {
      status: 400,
      success: false,
      message: "All fields are required",
    };
  }

  try {
    const users = await getUserByEmail(email);
    if (users?.email === email) {
      throw {
        status: 400,
        success: false,
        message: "Email already exists",
      };
    }

    if (password !== confPassword) {
      throw {
        status: 400,
        success: false,
        message: "Password does not match",
      };
    }

    const hashedPassword = await hashPassword(password);

    const user = await registerUser(id, name, email, hashedPassword);
    res.status(201).json({
      code: 201,
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw {
      status: 400,
      success: false,
      message: "Email and password are required",
    };
  }

  try {
    //find user by email
    const user = await getUserByEmail(email);

    if (!user) {
      throw {
        status: 404,
        success: false,
        message: "User not found",
      };
    }

    // Cek apakah password benar
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      throw {
        status: 401,
        success: false,
        message: "Wrong Password",
      };
    }

    //generate accessToken dan refreshToken JWT
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    //masukan refresh token ke database
    await createRefreshToken(user.id, refreshToken);

    res.cookie("accessToken", accessToken, {
      // secure: true,
      // httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.cookie("refreshToken", refreshToken, {
      // secure: true,
      // httpOnly: true,
    });

    //kirim response berupa accessToken dan user data
    res.json({
      code: 200,
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const tokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    if (!refreshToken) {
      throw {
        status: 401,
        success: false,
        message: "No refresh token provided",
      };
    }
    jwt.verify(
      refreshToken,
      REFRESH_SECRET_KEY,
      (err: Error | null, user: any) => {
        if (err) {
          throw {
            status: 403,
            success: false,
            message: "Verification failed",
          };
        }
        const newAccessToken = generateAccessToken(user.data);
        res.cookie("accessToken", newAccessToken, {
          // secure: true,
          // httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
        });
        res.status(200).json({ message: "Token refreshed successfully" });
      }
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const meController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

  if (!token || !SECRET_KEY) {
    throw {
      status: 401,
      success: false,
      message: "Unauthorized: No token provided",
    };
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { data: string };
    const user = await getUserDataById(decoded.data);

    if (!user) {
      throw {
        status: 404,
        success: false,
        message: "User not found",
      };
    }

    res.json(user);
    return;
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const logOutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    if (!refreshToken) {
      throw {
        status: 400,
        success: false,
        error: "No refresh token provided",
      };
    }
    //delete refresh token from database
    await deleteRefreshToken(refreshToken);

    //delete access token from cookie
    res.clearCookie("accessToken", {
      // httpOnly: true,
      // secure: false,
      // sameSite: "none",
    });

    //delete refresh token from cookie
    res.clearCookie("refreshToken", {
      // httpOnly: true,
      // secure: false,
      // sameSite: "none",
    });
    res
      .status(200)
      .json({ code: 200, success: true, message: "Logged out successfully" });
    return;
  } catch (error) {
    console.error(error);
    //delete access token from cookie
    res.clearCookie("accessToken", {
      // httpOnly: true,
      // secure: false,
      // sameSite: "none",
    });

    //delete refresh token from cookie
    res.clearCookie("refreshToken", {
      // httpOnly: true,
      // secure: false,
      // sameSite: "none",
    });
    next(error);
  }
};

export const checkToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw {
      status: 401,
      success: false,
      message: "Unauthorized: No token provided",
    };
    // return;
  }

  try {
    jwt.verify(token, SECRET_KEY!);
    res
      .status(200)
      .json({ code: 200, success: true, message: "Token is valid" });
    return;
  } catch (error) {
    console.error(error);
    next(error);
  }
};
