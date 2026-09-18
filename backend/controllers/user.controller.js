import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Cookie options helper
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
});

// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
export async function registerUser(req, res, next) {
    try {
        const { name, email, avatar, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists",
            });
        }

        const user = await User.create({
            name,
            email,
            avatar: avatar || undefined,
            password,
            role: role || "buyer",
        });

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 24 * 60 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, getCookieOptions());

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Login user & get tokens
// @route   POST /api/v1/users/login
// @access  Public
export async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        res.cookie("accessToken", accessToken, { ...getCookieOptions(), maxAge: 24 * 60 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, getCookieOptions());

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Logout user / clear cookies
// @route   POST /api/v1/users/logout
// @access  Private
export async function logoutUser(req, res, next) {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Get current user profile
// @route   GET /api/v1/users/profile
// @access  Private
export async function getUserProfile(req, res, next) {
    try {
        return res.status(200).json({
            success: true,
            data: req.user,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Refresh access token
// @route   POST /api/v1/users/refresh-token
// @access  Public
export async function refreshAccessToken(req, res, next) {
    try {
        const incomingRefreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Refresh token missing",
            });
        }

        const decoded = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET || "ecm_refresh_secret_key_super_secure_67890"
        );

        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid refresh token",
            });
        }

        const newAccessToken = user.generateAccessToken();

        res.cookie("accessToken", newAccessToken, {
            ...getCookieOptions(),
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
            error: error.message,
        });
    }
}