import Order from "../models/orders.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// @desc    Create a new order
// @route   POST /api/v1/orders
// @access  Private (Buyer/Any logged-in user)
export async function createOrder(req, res, next) {
    try {
        const { items, address, paymentMethod } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No order items provided",
            });
        }

        if (!address) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required",
            });
        }

        let totalAmount = 0;
        const processedItems = [];

        // Validate products and stock from database to prevent price tampering
        for (const item of items) {
            const product = await Product.findById(item.productId || item.product);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found with ID: ${item.productId || item.product}`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: "${product.title}". Available: ${product.stock}, requested: ${item.quantity}`,
                });
            }

            // Deduct stock
            product.stock -= item.quantity;
            await product.save();

            const itemSubtotal = product.price * item.quantity;
            totalAmount += itemSubtotal;

            processedItems.push({
                product: product._id,
                title: product.title,
                quantity: item.quantity,
                price: product.price, // Lock price snapshot
                image: product.image?.[0] || "",
            });
        }

        const order = await Order.create({
            user: req.user._id,
            products: processedItems,
            address,
            paymentMethod: paymentMethod || "Cash on Delivery",
            totalAmount,
            status: "pending",
        });

        // Link order to user's order history
        await User.findByIdAndUpdate(req.user._id, {
            $push: { orders: order._id },
        });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Get logged in user's orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
export async function getMyOrders(req, res, next) {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Get all orders (Seller/Admin)
// @route   GET /api/v1/orders
// @access  Private (Seller/Admin)
export async function getAllOrders(req, res, next) {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("products.product", "title price image")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Get single order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export async function getOrderById(req, res, next) {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("products.product", "title price image");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // Only the order owner or seller/admin can view the order
        if (
            order.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== "admin" &&
            req.user.role !== "seller"
        ) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: You cannot view this order",
            });
        }

        return res.status(200).json({
            success: true,
            data: order,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Update order status
// @route   PATCH /api/v1/orders/:id/status
// @access  Private (Seller/Admin)
export async function updateOrderStatus(req, res, next) {
    try {
        const { status, paymentStatus } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
}
