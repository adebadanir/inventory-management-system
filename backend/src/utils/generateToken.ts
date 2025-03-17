import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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

export { generateAccessToken, generateRefreshToken };
