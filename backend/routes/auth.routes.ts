import express from "express";
import {
  signUp,
  signIn,
  logout,
  refreshToken,
  me,
} from "../controllers/auth.controller";
import { authenticateToken, verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/me", authenticateToken, me);
router.post("/logout", logout);
router.get("/refresh", refreshToken);

export default router;
