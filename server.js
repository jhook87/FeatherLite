const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start Next.js server', err);
      process.exit(1);
    }

    console.log(`FeatherLite storefront ready on http://${hostname}:${port}`);
  });
});
