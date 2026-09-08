import mongoose from "mongoose";

let userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["seller", "buyer"],
            default: "buyer",
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);