const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Listen on all network interfaces
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Check if certificates exist
const certPath = path.join(__dirname, 'localhost.pem');
const keyPath = path.join(__dirname, 'localhost-key.pem');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error('\n❌ SSL Certificates not found!\n');
  console.log('Please generate certificates first:');
  console.log('1. Install mkcert: npm run cert:install');
  console.log('2. Generate certs: npm run cert:generate\n');
  console.log('Or see HTTPS_SETUP_GUIDE.md for detailed instructions.\n');
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log('\n🔐 HTTPS Server Ready!\n');
      console.log(`✅ Local:    https://localhost:${port}`);
      console.log(`✅ Network:  https://192.168.9.149:${port}`);
      console.log('\n💡 PWA "Install app" option will now work!\n');
    });
});
