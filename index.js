import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/routes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "public")));

// Use your custom routes file
app.use("/", router);

// 404 fallback (for missing files or routes)
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "public/pages/404/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
