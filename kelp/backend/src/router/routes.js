import express from "express";
import { authMiddleware, upload } from "../middleware.js";
import "dotenv/config";
import { setup, auth, getChatHistory, getMessagesByChatHistoryId } from '../controller.js';


const router = express.Router();

router.use(express.json());

// Authentication
router.post("/auth", auth);

// setup endpoint
router.post("/setup", upload.single("file"), authMiddleware, setup);

// get chathistory endpoint
router.get("/chatHistory", authMiddleware, getChatHistory);

// get messages by provider and model endpoint
router.post("/messagesByChatHistoryId", authMiddleware, getMessagesByChatHistoryId);

export default router;