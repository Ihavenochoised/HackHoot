import express from "express";
import router from "./routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

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
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
