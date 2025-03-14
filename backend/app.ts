import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";

import errorHandler from "./middleware/errorHandler";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use(
  "/api/users/avatar",
  express.static(path.join(__dirname, "./uploads/images/avatars"))
);
app.use(
  "/api/products/productImage",
  express.static(path.join(__dirname, "./uploads/images/products"))
);

app.use(errorHandler);

export default app;
