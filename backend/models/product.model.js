import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Product title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
        },
        images: {
            type: [String],
            required: [true, "At least one product image is required"],
            default: [],
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"],
        },
        stock: {
            type: Number,
            required: [true, "Stock count is required"],
            min: [0, "Stock cannot be negative"],
            default: 0,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Seller reference is required"],
        },
        rating: {
            type: Number,
            default: 0,
            min: [0, "Rating cannot be negative"],
            max: [5, "Rating cannot exceed 5"],
        },
        numReviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Product", productSchema);
