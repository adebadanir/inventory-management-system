import { Request, Response } from "express";
import { createId } from "@paralleldrive/cuid2";

import { db } from "../config/db";
import { User } from "../models/user.model";
import { hashPassword } from "../lib/hashPassword";
import path from "path";
import fs from "fs";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, avatar, role FROM users WHERE deleted_at IS NULL"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "ID is required" });
      return;
    }
    const [user]: any = await db.query(
      "SELECT name, email, avatar, role FROM users WHERE id = ? AND deleted_at IS NULL",
      [id]
    );

    if (user.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user[0]);
    return;
  } catch (error) {
    res.status(500).json({ error: `Fetch user failed: ${error}` });
    return;
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confPassword } = req.body as User;
    const id = createId();
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if ((existingUsers as any[]).length > 0) {
      res.status(400).json({ error: "Email already exists" });
      return;
    }
    if (password !== confPassword) {
      res.status(400).json({ message: "Password does not match" });
      return;
    } else {
      const hashedPassword = await hashPassword(password);
      await db.query(
        "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
        [id, name, email, hashedPassword]
      );
      res.status(201).json({ message: "User created successfully" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: `Database error: ${error}` });
    return;
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body as User;
    const id = req.params.id;
    if (!id || !name || !email) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const [rows]: any = await db.query("SELECT id FROM users WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    } else {
      const avatar = req.file ? req.file.filename : null;
      const query = avatar
        ? "UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?"
        : "UPDATE users SET name = ?, email = ? WHERE id = ?";
      const values = avatar ? [name, email, avatar, id] : [name, email, id];
      await db.query(query, values);
      res.status(200).json({ message: "User updated successfully" });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error });
    return;
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }
    const [rows]: any = await db.query(
      "SELECT avatar FROM users WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const avatarFilename = rows[0].avatar;
    if (avatarFilename) {
      const filePath = path.join(
        __dirname,
        "../uploads/images/",
        avatarFilename
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("File deleted:", filePath);
      } else {
        console.log("File not found:", filePath);
      }
    }
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    res.status(200).json({ message: "User deleted successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Database error" });
    return;
  }
};

export const makeAdmin = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "ID is required" });
      return;
    }
    await db.query("UPDATE users SET role = 'admin' WHERE id = ?", [id]);
    res.status(200).json({ message: "User made admin successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Database error" });
    return;
  }
};
