// Inject environment variables
import "dotenv/config";

// Prevent stdout buffering to ensure logs are printed immediately
process.stdout.write = process.stdout.write.bind(process.stdout);

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pageRouter from "./routes/routes.js";
import apiRouter from "./routes/api.js";
import { cleanup } from "./routes/api.js";

import http from "http";
import { sessionMiddleware } from "./services/session.js";
import { Server } from "socket.io";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = http.createServer(app);
const io = new Server(server, {
    path: "/ws",
});

// Middleware
app.use(express.static(path.join(__dirname, "public")));
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// 🧩 Routers
app.use("/", pageRouter);
app.use("/api", express.json(), apiRouter);

// 404 fallback
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

const PORT = process.env.PORT || 3000;
globalThis.PORT = PORT;

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

async function checkReachable(url) {
    try {
        const res = await fetch(url, { method: "GET" });

        if (res) {
            console.log(`[OK] ${url} is reachable`);
        }
    } catch (err) {
        console.warn(
            `[WARN] Could not reach ${url}, PDF generation may not work as expected`,
        );
    }
}

function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// Run checks at startup
checkReachable("https://fonts.gstatic.com");
checkReachable("https://fonts.googleapis.com");

// Shutdown the server gracefully
async function shutdown() {
    console.log("\n🛑 Shutting down server...");
    try {
        await cleanup();
    } finally {
        process.exit(0);
    }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("SIGHUP", shutdown);
