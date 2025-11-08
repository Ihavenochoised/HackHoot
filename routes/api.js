import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filesDir = path.join(__dirname, "..", "public", "files");

// Simple API route test
router.get("/", (req, res) => {
    res.json({ message: "Welcome to the API 🚀" });
});

// 🧩 Dynamic download route: /api/download/:filename
router.get("/download/:filename", (req, res) => {
    const file = path.join(filesDir, req.params.filename);

    res.download(file, err => {
        if (err) {
            console.error("Download failed:", err);
            res.status(404).json({ error: "File not found." });
        }
    });
});

// Example JSON endpoint: /api/status
router.get("/status", (req, res) => {
    res.json({ uptime: process.uptime(), status: "OK", time: new Date() });
});

export default router;
