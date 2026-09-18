import mongoose from "mongoose";


const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }
        ],
        quantities: {
            type: Number,
            required: true,
        },
        address: {
            type: String,
            required: [true, "Shipping address is required"],
        },
        paymentMethod: {
            type: String,
            default: "Cash on Delivery",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Order", orderSchema);
