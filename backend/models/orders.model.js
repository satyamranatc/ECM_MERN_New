import mongoose from "mongoose";

let orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
            },
        ],
        address: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "delivered", "cancelled","returned","replaced"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);