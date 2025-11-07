import express from "express";
import path from "path";
import { fileURLToPath } from "url"; // Import to convert URL to path

const app = express();
const PORT = process.env.PORT || 3000;

// Get the current directory using import.meta.url
const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the directory name

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the dynamic router (assuming it's defined elsewhere)
import router from "./routes/routes.js";
app.use("/", router);

// 404 handler (if route doesn't match)
app.use((req, res) => {
    res.status(404).send("404 Not Found 😢");
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke! 💥");
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
