import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "Welcome to the API 🚀" });
});

router.get("/status", (req, res) => {
    res.json({ uptime: process.uptime(), status: "OK", time: new Date() });
});

router.post("/kahoot-proxy", (req, res) => {
    proxyRequest(req, res);
});

router.post("/convert-pdf", (req, res) => {
    htmlToPDF(req, res);
});

router.post("/browser-pages", (req, res) => {
    getBrowserPages(req, res);
});
// Implement a key later

// Work in progress
// router.post("/reqjoin", (req, res) => {
//     console.log("[kahoot_bot] Request body:", req.body);
//     const { quizId, botName, botAmount } = req.body;
//     startBotting(quizId, botName, botAmount);
// });

// router.post("/kahoot2fa", (req, res) => {
//     // In case the above path fails because of Kahoot's 2FA
//     // We'll try the 2FA code the user provides
//     const { quizId, botName, botAmount, auth2fa } = req.body;
//     startBotting(quizId, botName, botAmount, auth2fa);
// })

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
        let quizName = responseBody.title;
        let quizURL = externalApiURL + UUID;
        console.log(`[kahoot_proxy] Kahoot fetched: ${quizName}, ${quizURL}`);
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

// Work in progress
// import Kahoot from "kahoot.js-latest";

// function startBotting(quizId, botName, botAmount) {
//     // May fail because of the 2FA
//     for (let i = 0; i < botAmount; i++) {
//         let botName_final = `${botName} ${i}`
//         playKahoot(quizId, botName_final);
//     }
// }

// function playKahoot(quizId, botName, auth2fa) {
//     const client = new Kahoot();
//     if (!/^\d+$/.test(String(quizId))) {
//         throw new Error("Join code must be numeric");
//     }
//     client.join(Number(quizId), botName);
//     client.on("2Step", () => {
//         console.log("[kahoot_bot] 2FA Challenge Received!");
//         // The server sends an array of numbers representing the sequence
//         // (0: Red/Triangle, 1: Diamond/Blue, 2: Circle/Yellow, 3: Square/Green)
//         console.log("[kahoot_bot] Required Steps:", steps);
//         // 3. Respond to the 2FA challenge
//         client.answer2Step(steps).then(() => {
//             console.log("[kahoot_bot] 2FA solved successfully!");
//         }).catch((err) => {
//             console.error("[kahoot_bot] Failed to solve 2FA:", err);
//         });
//     });
//     client.on("Joined", () => {
//         console.log(`[kahoot_bot] ${botName} joined the Kahoot!`);
//     });
// }

// function leaveKahoot() {
//     // Implement functionality
// }

// -----------------------------------------

let shuttingDown = false;

async function cleanup() {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("🛑 Shutdown triggered... waiting for processes to settle");
    await new Promise(r => setTimeout(r, 300));
    try {
        if (!browser) return;
        if (!browser.connected) {
            console.log("Browser already dead");
            return;
        }
        console.log("[puppeteer] Closing browser...");
        await browser.close();
        console.log("[puppeteer] Browser closed.");
    } catch (err) {
        console.log("[puppeteer] Cleanup skipped (browser already gone)");
    }
    console.log("[puppeteer] Cleanup complete, exiting now.");
}

export { cleanup };

export default router;
