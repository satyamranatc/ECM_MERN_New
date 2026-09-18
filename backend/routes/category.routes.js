import express from "express";
import {
    createCategory,
    getAllCategories,
    deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);

// Protected routes
router.post("/", verifyJWT, authorizeRoles("seller", "admin"), createCategory);
router.delete("/:id", verifyJWT, authorizeRoles("admin"), deleteCategory);

export default router;
