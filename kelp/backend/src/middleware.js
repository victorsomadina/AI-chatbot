import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "./database/schema.js";
import multer from 'multer';

dotenv.config();

// authentication middleware
const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).send("Access Denied");
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        const user = await User.findOne({ 
            where: { 
                email: verified.email 
            } 
        });
        req.user = user;
        next();
    } catch (error) {
        res.status(400).send("Invalid Token");
    }
};

// multer middleware for file upload
const storage = multer.memoryStorage(); 
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"), false);
        }
        cb(null, true);
    },
});

export {authMiddleware, upload};