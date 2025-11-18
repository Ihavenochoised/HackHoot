import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = `${process.env.PUBLIC_URL || "http://localhost:" + (process.env.PORT || 3000)}/`;
console.log(`Base URL used: 
${BASE_URL}
If the base URL above is incorrect, stop this process and ammend the code. `)

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API 🚀' });
});

router.get('/status', (req, res) => {
    res.json({ uptime: process.uptime(), status: 'OK', time: new Date() });
});

router.post('/kahoot-proxy', (req, res) => {
    console.log('Request body:', req.body);  // To check if you’re receiving the data correctly
    proxyRequest(req, res);
});

router.post('/convert-pdf', (req, res) => {
    htmlToPDF(req, res);
});

// ------------- API FUNCTIONS -------------

import puppeteer from 'puppeteer';

async function proxyRequest(req, res) {
    try {
        const { UUID } = req.body;
        if (!UUID) return res.status(400).json({ error: "missing UUID in body" });

        const externalApiURL = 'https://kahoot.it/rest/kahoots/';
        const externalApiResponse = await fetch(externalApiURL + UUID);
        if (!externalApiResponse.ok) {
            throw new Error(`External API returned error: ${externalApiResponse.statusText}`);
        }
        const responseBody = await externalApiResponse.json();
        res.status(externalApiResponse.status).json(responseBody);
    } catch (err) {
        console.error('Error in proxy route:', err);
        res.status(500).json({ error: 'Proxy request failed' });
    }
}

async function htmlToPDF(req, res) {
    const { htmlContent } = req.body; 
    if (!htmlContent) {
        return res.status(400).json({ error: 'No HTML content provided' });
    }
    console.log('HTML Content Recieved: ', htmlContent);
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ]
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, {
            waitUntil: 'domcontentloaded',
            url: BASE_URL
        });

        const bodyHandle = await page.$('body');
        const { width, height } = await bodyHandle.boundingBox();
        await bodyHandle.dispose();

        // await page.setViewport({ width: Math.ceil(width), height: Math.ceil(height) });

        // const pdfBuffer = await page.pdf({
        //     printBackground: true,
        //     width: `${Math.ceil(width)}px`,
        //     height: `${Math.ceil(height)}px`,
        //     pageRanges: '1',
        // });
        const pdfBuffer = await page.screenshot({ fullPage: true });

        res.set('Content-Type', 'image/png');
        await browser.close();

        // res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
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
