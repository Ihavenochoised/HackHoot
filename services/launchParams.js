import { exec } from 'child_process';
import { promisify } from 'util';
import getRuntime from './getRuntime.js';

async function resolveLaunchOptions() {
    let runtime = getRuntime();
    console.log(`[puppeteer] detected runtime: ${runtime}`);
    if (runtime === 'replit') {
        const { stdout } = await promisify(exec)('which chromium');
        return {
            executablePath: stdout.trim(),
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-gpu'
            ],
        };
    } else if (runtime === 'render') {
        return {
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        };
    } else if (runtime === 'windows') {
        return {
            headless: 'new',
        };
    }
    return { headless: 'new' };
}

export default resolveLaunchOptions;