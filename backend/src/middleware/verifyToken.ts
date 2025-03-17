import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "default_secret_key";

export interface AuthRequest extends Request {
  user?: any;
}

// Middleware untuk memverifikasi token JWT
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Ambil token dari cookie atau authorization header
  const token: string = req.cookies?.accessToken;

  try {
    if (!token) {
      throw {
        status: 403,
        success: false,
        message: "Unauthorized: No token provided",
      };
    }
    // Verifikasi token
    jwt.verify(token, SECRET_KEY!, (err, user) => {
      if (err) throw { status: 403, message: "Verification failed" };
      req.user = user;
      next();
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Middleware untuk verifikasi Admin
export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Forbidden: Admins only" });
    return;
  }
  next();
};
