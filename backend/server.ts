import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import ikdRoutes from "./routes/ikdRoutes.js";
import { startDailyAggregationJob } from "./jobs/dailyAggregationJob.js";
import { startBaselineInitializationJob } from "./jobs/baselineInitializationJob.js";
import { startDailyDeviationAnalyzer } from "./jobs/dailyDeviationAnalyzerJob.js";

dotenv.config();
connectDB();

// Start cron jobs
startDailyAggregationJob();
startBaselineInitializationJob(); // Starts baseline processor at 01:00
startDailyDeviationAnalyzer(); // Starts deviation analyzer at 02:00

const app = express();
app.set('trust proxy', 1); // Required for secure scaling behind load balancers using express-rate-limit
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ikd", ikdRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
