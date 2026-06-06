const https = require('https');

module.exports = function handler(req, res) {
  const code = ((req.query.c || '')).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!code) { res.status(400).end(); return; }

  const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(code)}&margin=20&bgcolor=ffffff&color=000000`;

  https.get(url, (imgRes) => {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    imgRes.pipe(res);
  }).on('error', () => res.status(502).end());
};
