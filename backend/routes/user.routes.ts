import express from "express";
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  makeAdmin,
} from "../controllers/user.controller";
import upload from "../config/uploadConfig";
import { checkUserById } from "../middleware/checkUserById";
import { verifyAdmin, verifyToken } from "../middleware/verifyToken";

const router = express.Router();

router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUserById);
router.post("/", verifyToken, verifyAdmin, createUser);
router.put(
  "/:id",
  verifyToken,
  checkUserById,
  upload.single("avatar"),
  updateUser
);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);
//admin-only
router.put("/make-admin/:id", verifyToken, verifyAdmin, makeAdmin);

export default router;
