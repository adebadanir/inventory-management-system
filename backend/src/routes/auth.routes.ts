import express from "express";
import {
  signUpController,
  loginController,
  logOutController,
  meController,
  tokenController,
  checkToken,
} from "../controllers/auth.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.post("/signup", signUpController);
router.post("/login", loginController);
router.get("/generate-token", tokenController);
router.get("/me", verifyToken, meController);
router.post("/logout", logOutController);
router.get("/check-token", checkToken);

export default router;
