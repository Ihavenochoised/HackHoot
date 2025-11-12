import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pageRouter from "./routes/routes.js";
import apiRouter from "./routes/api.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🧩 Routers
app.use("/", pageRouter);
app.use("/api", apiRouter);

// 404 fallback
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public/pages/404/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

import { exec } from 'child_process';

// Function to execute a shell command and log the result
function findChromium() {
    exec('find / -name "chromium*" 2>/dev/null', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`Chromium locations found: ${stdout}`);
    });
}

// Call the function to search for Chromium
findChromium();

