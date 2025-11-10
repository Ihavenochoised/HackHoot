import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filesDir = path.join(__dirname, '..', 'public');

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API 🚀' });
});

router.get('/status', (req, res) => {
    res.json({ uptime: process.uptime(), status: 'OK', time: new Date() });
});

router.post('/proxy', (req, res) => {
    proxyRequest(req, res);
});

router.post('/convert-pdf', (req, res))

// ------------- API FUNCTIONS -------------

import puppeteer from 'puppeteer';

async function proxyRequest(req, res) {
    try {
        const { UUID } = req.body;
        if (!UUID) return res.status(400).json({ error: "missing UUID in body" });
        
        // Make the request to the external API (could be a POST, GET, etc.)
        const externalApiURL = 'https://kahoot.it/rest/kahoots/';
        const externalApiResponse = await fetch(externalApiURL + UUID);
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
