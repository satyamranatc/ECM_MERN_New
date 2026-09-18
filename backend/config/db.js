import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error(
            `👉 Ensure MongoDB is running locally (e.g. mongodb://127.0.0.1:27017) or update MONGO_URI in backend/.env`
        );
    }
};

export default connectDB;
