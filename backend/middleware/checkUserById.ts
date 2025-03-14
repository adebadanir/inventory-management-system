import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";

export const checkUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    const [rows]: any = await db.query(
      "SELECT id FROM users WHERE id = ? AND deleted_at IS NULL",
      [id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Database error" });
    return;
  }
};
