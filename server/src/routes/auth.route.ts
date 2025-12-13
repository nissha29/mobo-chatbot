import express, { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index";
import { authenticateUser, AuthRequest } from "../middleware/auth.middleware";
import { RegisterRequest, LoginRequest, ApiResponse } from "../types/index";

const authRouter = Router();

// Register a new user
authRouter.post("/register", async (req: express.Request, res: Response<ApiResponse>) => {
  try {
    const { name, phone, address, email, password }: RegisterRequest = req.body;

    if (!name || !phone || !address || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        error: "VALIDATION_ERROR"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ phone }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this phone or email",
        error: "USER_EXISTS"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      phone,
      address,
      email,
      password: hashedPassword
    });

    const jwtSecret = process.env.JWT_SECRET || "12345";
    const token = jwt.sign(
      {
        userId: newUser._id.toString(),
        phone: newUser.phone,
        email: newUser.email
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          userId: newUser._id.toString(),
          name: newUser.name,
          phone: newUser.phone,
          address: newUser.address,
          email: newUser.email,
        },
        token
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message || "INTERNAL_ERROR"
    });
  }
});

// Login user
authRouter.post("/login", async (req: express.Request, res: Response<ApiResponse>) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        error: "VALIDATION_ERROR"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please register first.",
        error: "USER_NOT_FOUND"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
        error: "INVALID_CREDENTIALS"
      });
    }

    const jwtSecret = process.env.JWT_SECRET || "12345";
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        phone: user.phone,
        email: user.email
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          userId: user._id.toString(),
          name: user.name,
          phone: user.phone,
          address: user.address,
          email: user.email
        },
        token
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message || "INTERNAL_ERROR"
    });
  }
});

// Get user's info
authRouter.get("/me", authenticateUser, async (req: AuthRequest, res: Response<ApiResponse>) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        error: "UNAUTHORIZED"
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND"
      });
    }

    res.json({
      success: true,
      message: "User data retrieved successfully",
      data: {
        userId: user._id.toString(),
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user data",
      error: error.message || "INTERNAL_ERROR"
    });
  }
});

export default authRouter;