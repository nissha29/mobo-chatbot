import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { connectDB } from "./config/db.config";
import { authenticateUser } from "./middleware/auth.middleware";
import authRouter from "./routes/auth.route";
import appRouter from "./routes/app.route";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Chatbot API Server is running",
    });
});

app.use("/api/auth", authRouter);
app.use("/api/app", authenticateUser, appRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
});