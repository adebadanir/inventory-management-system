import { RowDataPacket } from "mysql2";
import db from "../config/db";

const getEmailById = async (id: string) => {
  const [result] = await db.query<RowDataPacket[]>(
    "SELECT email FROM users WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  return result.length > 0 ? result[0].email : null;
};

const getUserByEmail = async (email: string) => {
  const [result] = await db.query<RowDataPacket[]>(
    "SELECT id, email, password FROM users WHERE email = ? AND deleted_at IS NULL",
    [email]
  );
  return result.length > 0 ? result[0] : null;
};

export { getEmailById, getUserByEmail };
