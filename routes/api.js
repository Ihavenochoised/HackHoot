import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API 🚀' });
});

router.get('/status', (req, res) => {
    res.json({ uptime: process.uptime(), status: 'OK', time: new Date() });
});

router.post('/kahoot-proxy', (req, res) => {
    console.log('Request body:', req.body);
    proxyRequest(req, res);
});

router.post('/convert-pdf', (req, res) => {
    htmlToPDF(req, res);
});

router.post('/browser-pages', (req, res) => {
    getBrowserPages(req, res);
})
// Implement a key later

// ------------- API FUNCTIONS -------------

import puppeteer from 'puppeteer';

let browser;
const browserLoaded = (async () => {
    try {
        console.log('⚠️ Launching browser early...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-web-security',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-extensions',
                '--disable-gpu',
                '--single-process',
                '--no-zygote',
            ]
        });
        console.log('✅ Browser successfully launched');
        return true;
    } catch (err) {
        console.error(`❌ Fatal error, browser did not launch. Error:`, err);
        return false;
    }
})();

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
    const browserReady = await browserLoaded;
    if (!browserReady) {
        console.log('⛔ Browser has not launched, failing the request to /api/convert-pdf');
        return res.status(503).json({ error: 'The PDF generation service is not ready' });
    }
    let { htmlContent } = req.body;
    if (!htmlContent) {
        return res.status(400).json({ error: 'No HTML content provided' });
    }
    console.log('HTML Content Recieved:', htmlContent);
    const emojiStylesheet = ``;
    const siteFontStylesheet = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">`;
    htmlContent = emojiStylesheet + htmlContent;
    htmlContent = siteFontStylesheet + htmlContent;
    console.log('Modified HTML Content Recieved:', htmlContent);
    try {
        const page = await browser.newPage();
        await page.goto(`http://localhost:${globalThis.PORT}`, {
            waitUntil: 'load'
        });
        await page.evaluate(async (html) => {
            document.documentElement.innerHTML = html;
            await document.fonts.ready;
        }, htmlContent);

        const bodyHandle = await page.$('body');
        const { width, height } = await bodyHandle.boundingBox();
        await bodyHandle.dispose();

        await page.setViewport({ width: Math.ceil(width), height: Math.ceil(height) });

        const pdfBuffer = await page.pdf({
            printBackground: true,
            width: `${Math.ceil(width)}px`,
            height: `${Math.ceil(height)}px`,
            pageRanges: '1',
        });

        await page.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
}

async function getBrowserPages(req, res) {
    const browserReady = await browserLoaded;
    if (!browserReady) {
        console.log('⛔ Browser has not launched, failing the request to /api/browser-pages');
        return res.status(503).json({ error: 'The browser has not launched' });
    }
    const pages = await browser.pages();
    const pageObjects = await Promise.all(
        pages.map(async (page) => ({
            url: page.url(),
            title: await page.title()
        }))
    );
    res.json(pageObjects);
}

function joinKahoot() {
    // Implement functionality
}

function leaveKahoot() {
    // Implement functionality
}

// -----------------------------------------

export default router;
