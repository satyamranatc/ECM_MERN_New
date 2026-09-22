import express from "express";
import {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
} from "../controllers/order.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All order routes require authentication
router.use(verifyJWT);

router.post("/", createOrder);
router.get("/", authorizeRoles("seller", "admin"), getAllOrders);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", authorizeRoles("seller", "admin"), updateOrderStatus);

export default router;
