import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filesDir = path.join(__dirname, '..', 'public', 'files');

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API 🚀' });
});

router.get('/status', (req, res) => {
    res.json({ uptime: process.uptime(), status: 'OK', time: new Date() });
});

router.post('/proxy', async (req, res) => {
    proxyRequest(req, res);
});

// ------------- API FUNCTIONS -------------

function proxyRequest(req, res) {
    try {
        // Target API URL (replace with actual endpoint)
        const externalApiURL = 'https://kahoot.it/rest/kahoots/';
        const combinedURL = externalApiURL + req.body.UUID;

        // Make the request to the external API (could be a POST, GET, etc.)
        const externalApiResponse = await fetch(combinedURL);
        const responseBody = await externalApiResponse.json();
        externalApiResponse.headers.forEach((value, name) => {
            res.setHeader(name, value);  // Forward each header from the external API to the client
        });
        // Send back the body from the external API
        res.status(externalApiResponse.status).json(responseBody);
    } catch (err) {
        console.error('Error in proxy route:', err);
        res.status(500).json({ error: 'Proxy request failed' });
    }
}

function joinKahoot() {
    // Implement functionality
}

function leaveKahoot() {
    // Implement functionality
}

// -----------------------------------------

export default router;
