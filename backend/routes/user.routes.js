import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    refreshAccessToken,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// Protected routes
router.post("/logout", verifyJWT, logoutUser);
router.get("/profile", verifyJWT, getUserProfile);

export default router;
