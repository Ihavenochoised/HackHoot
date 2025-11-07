// index.js
import express from "express";
import path from "path"; // To handle file paths
import router from "./routes/routes.js"; // Import routes

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the dynamic router
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
