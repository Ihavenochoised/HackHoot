const { join } = require('path');
const { execSync } = require('child_process');

let executablePath;
try {
    executablePath = execSync('which chromium', { encoding: 'utf8' }).trim();
} catch (e) {
    executablePath = undefined;
}

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
    executablePath,
    skipDownload: true,
};
