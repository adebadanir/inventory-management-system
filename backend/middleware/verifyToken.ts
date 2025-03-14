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
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Simpan user ke dalam request object
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(403).json({ error: "Token expired" });
      return;
    }
    if (error.name === "JsonWebTokenError") {
      res.status(403).json({ error: "Invalid token" });
      return;
    }
    res.status(500).json({ error: "Internal Server Error" });
    return;
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
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(token, process.env.SECRET_KEY as string, (err, user) => {
    req.user = user; // Simpan user di request
    next();
  });
}
