/**
 * Sovereign Budget - Local Offline Development Server
 * Zero-dependency cross-platform static server for Linux, Windows, and macOS.
 * Provides unrestricted origin-bound storage access without file:// security restrictions.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = parseInt(process.env.PORT || process.argv[2] || '8000', 10);
const BASE_DIR = path.resolve(__dirname);

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/' || reqUrl === '') {
        reqUrl = '/index.html';
    }

    const safeSuffix = path.normalize(reqUrl).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(BASE_DIR, safeSuffix);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp'
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

if (require.main === module) {
    server.listen(PORT, '127.0.0.1', () => {
        const url = `http://127.0.0.1:${PORT}`;
        console.log(`\n======================================================`);
        console.log(` Sovereign Budget - Running with full storage access!`);
        console.log(` URL: ${url}`);
        console.log(` Platform: ${process.platform} (${process.arch})`);
        console.log(` Press Ctrl+C to terminate the local server.`);
        console.log(`======================================================\n`);

        // Automatically open default system browser
        const cmd = process.platform === 'win32'
            ? `start "" "${url}"`
            : (process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`);

        exec(cmd, () => {});
    });
}

module.exports = server;
