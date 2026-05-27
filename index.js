// Inject environment variables
import 'dotenv/config';

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pageRouter from "./routes/routes.js";
import apiRouter from "./routes/api.js";
import { cleanup } from "./routes/api.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.static(path.join(__dirname, "public")));

// 🧩 Routers
app.use("/", pageRouter);
app.use("/api", express.json(), apiRouter);

// 404 fallback
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public/404.html"));
});

const PORT = process.env.PORT || 3000;
globalThis.PORT = PORT;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

async function checkReachable(url) {
    try {
        const res = await fetch(url, { method: "GET" });

        if (res) {
            console.log(`[OK] ${url} is reachable`);
        }
    } catch (err) {
        console.warn(`[WARN] Could not reach ${url}, PDF generation may not work as expected`);
    }
}

// Run checks at startup
checkReachable("https://fonts.gstatic.com");
checkReachable("https://fonts.googleapis.com");

// Shutdown the server gracefully
let shuttingDown = false;

async function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("\n🛑 Shutting down server...");
    await cleanup();
    console.log("\n🛑 Server shutdown complete.")
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGHUP", shutdown)