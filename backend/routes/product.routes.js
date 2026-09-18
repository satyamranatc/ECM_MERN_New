import express from "express";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes (Seller/Admin)
router.post("/", verifyJWT, authorizeRoles("seller", "admin"), createProduct);
router.put("/:id", verifyJWT, authorizeRoles("seller", "admin"), updateProduct);
router.delete("/:id", verifyJWT, authorizeRoles("seller", "admin"), deleteProduct);

export default router;
