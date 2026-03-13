import express from "express";
import {chatWithBot,getChatHistory,saveChatManually,deleteChatHistory,} from "../controller/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, chatWithBot);
router.get("/history", protect, getChatHistory);
router.post("/save", protect, saveChatManually);
router.delete("/history/:id", protect, deleteChatHistory);

export default router;
