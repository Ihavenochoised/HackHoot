import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Welcome to the API 🚀" });
});

router.get("/status", (req, res) => {
    res.json({ uptime: process.uptime(), status: "OK", time: new Date() });
});

router.post("/kahoot-proxy", (req, res) => {
    console.log("Request body:", req.body);
    proxyRequest(req, res);
});

router.post("/convert-pdf", (req, res) => {
    htmlToPDF(req, res);
});

router.post("/browser-pages", (req, res) => {
    getBrowserPages(req, res);
});
// Implement a key later

// ------------- API FUNCTIONS -------------

import puppeteer from "puppeteer";
import resolveLaunchOptions from "../services/launchParams.js"

let browser;
const browserLoaded = (async () => {
    try {
        let optns = await resolveLaunchOptions();
        browser = await puppeteer.launch(optns);
        console.log("✅ Browser successfully launched");
        return true;
    } catch (err) {
        console.error(`❌ Fatal error, browser did not launch. Error:`, err);
        return false;
    }
})();

async function proxyRequest(req, res) {
    try {
        const { UUID } = req.body;
        if (!UUID)
            return res.status(400).json({ error: "missing UUID in body" });

        const externalApiURL = "https://kahoot.it/rest/kahoots/";
        const externalApiResponse = await fetch(externalApiURL + UUID);
        if (!externalApiResponse.ok) {
            throw new Error(
                `External API returned error: ${externalApiResponse.statusText}, with response of ${await externalApiResponse.text()}`,
            );
        }
        const responseBody = await externalApiResponse.json();
        res.status(externalApiResponse.status).json(responseBody);
    } catch (err) {
        console.error("Error in proxy route:", err);
        res.status(500).json({ error: "Proxy request failed, " + err.message });
    }
}

async function htmlToPDF(req, res) {
    const browserReady = await browserLoaded;
    if (!browserReady) {
        console.log(
            "⛔ Browser has not launched, failing the request to /api/convert-pdf",
        );
        return res
            .status(503)
            .json({ error: "The PDF generation service is not ready" });
    }
    const { htmlContent: originalHTMLContent } = req.body;
    if (!originalHTMLContent) {
        return res.status(400).json({ error: "No HTML content provided" });
    }
    console.log("HTML Content Recieved:", originalHTMLContent);
    const emojiStylesheet = `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap" rel="stylesheet">`;
    const siteFontStylesheet = `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap" rel="stylesheet">`;
    const siteStylesheet = `<link rel="stylesheet" href="/stylesheets/style.css" />`;
    const modifiedHTMLContent = `<!DOCTYPE html>
            <html lang="en">
            <head>
                ${emojiStylesheet}
                ${siteFontStylesheet}
                ${siteStylesheet}
            </head>
            <body>
                ${originalHTMLContent}
            </body>
        </html>`;
    console.log("Modified HTML Content:", modifiedHTMLContent);
    try {
        let scaleFactor = 2; // Allows you to add a PDF quality slider later
        const page = await browser.newPage();
        await page.goto(`http://localhost:${globalThis.PORT}`, {
            waitUntil: "networkidle0",
        });
        /* 
            So apparently Chromium's PDF generation is a bit buggy, so we need to render the HTML to an image first, then render that image to a PDF.
            Sadly we lose the ability to have selectable text in the PDF, but it's a small price to pay for a working PDF.
            Hope no one notices 😉
        */
        await page.evaluate(async (html) => {
            document.documentElement.innerHTML = html;
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }, modifiedHTMLContent);
        const bodyHandle = await page.$('body'); 
        const { width, height } = await bodyHandle.boundingBox();
        const paddingBuffer = 20; 
        const finalWidth = Math.ceil(width) + (paddingBuffer * scaleFactor);
        const finalHeight = Math.ceil(height) + (paddingBuffer * scaleFactor);
        await page.setViewport({
            width: finalWidth,
            height: finalHeight,
            deviceScaleFactor: scaleFactor
        });
        const screenshotBuffer = await page.screenshot({ encoding: "base64" }); 
        await bodyHandle.dispose();
        const imgHtml = `
          <html>
            <body style="margin: 0; padding: 0; background: white; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
              <img src="data:image/png;base64,${screenshotBuffer}" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;" />
            </body>
          </html>
        `;
        await page.setContent(imgHtml);
        const pdfBuffer = await page.pdf({
            printBackground: true,
            width: "210mm", 
            height: `${finalHeight + 20}px`, 
            margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
        });
        await page.close();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Length", pdfBuffer.length);
        res.end(pdfBuffer);
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
}

async function getBrowserPages(req, res) {
    const browserReady = await browserLoaded;
    if (!browserReady) {
        console.log(
            "⛔ Browser has not launched, failing the request to /api/browser-pages",
        );
        return res.status(503).json({ error: "The browser has not launched" });
    }
    const pages = await browser.pages();
    const pageObjects = await Promise.all(
        pages.map(async (page) => ({
            url: page.url(),
            title: await page.title(),
        })),
    );
    res.json(pageObjects);
}

// ------------- KAHOOT FUNCTIONS -------------

/*
Work in progress

import Kahoot from "kahoot.js-latest";

function joinKahoot(join_code, name, suffix = '', number) {
    const client = new Kahoot();
    if (!/^\d+$/.test(String(join_code))) {
        throw new Error("Join code must be numeric");
    }
    client.join(Number(join_code), )
}

function leaveKahoot() {
    // Implement functionality
}*/

// -----------------------------------------

export default router;
