import { RowDataPacket } from "mysql2";
import db from "../config/db";

const registerUser = async (
  id: string,
  name: string,
  email: string,
  password: string
) => {
  const [result] = await db.query(
    "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
    [id, name, email, password]
  );
  return result;
};

const createRefreshToken = async (id: string, refreshToken: string) => {
  const [result] = await db.query(
    "UPDATE users SET refresh_token = ? WHERE id = ? AND deleted_at IS NULL",
    [refreshToken, id]
  );
  return result;
};

const getUserDataById = async (id: string) => {
  const [result] = await db.query(
    "SELECT id, name, email, avatar, role FROM users WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  return result;
};

const getUserByRefreshToken = async (refreshToken: string) => {
  const [result] = await db.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE refresh_token = ?",
    [refreshToken]
  );
  if (result.length > 0) {
    return result[0] as RowDataPacket; // Ambil ID dari hasil query
  }

  return null; // Jika tidak ditemukan, kembalikan null
};

const deleteRefreshToken = async (id: string) => {
  const [result] = await db.query(
    "UPDATE users SET refresh_token = NULL WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  return result;
};

export {
  registerUser,
  createRefreshToken,
  getUserDataById,
  getUserByRefreshToken,
  deleteRefreshToken,
};
