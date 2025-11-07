import express from "express";
import fs from "fs";

const router = express.Router();

// Load routes from routes.json
const routes = JSON.parse(fs.readFileSync("./routes/routes.json", "utf8"));

// Dynamically register routes
routes.forEach((r) => {
    const method = r.method.toLowerCase();
    
    // Handle GET, POST, etc. dynamically
    if (typeof router[method] === "function") {
        router[method](r.path, (req, res) => {
            if (r.type === "json") {
                // Respond with JSON
                res.json(r.response);
            } else if (r.type === "function") {
                // Call a function (you can expand this logic)
                res.send(r.response + " (Dynamic content!)");
            } else {
                // Default response (text)
                res.send(r.response);
            }
        });
    } else {
        console.warn(`⚠️ Unsupported method: ${r.method} for path: ${r.path}`);
    }
});

export default router;
