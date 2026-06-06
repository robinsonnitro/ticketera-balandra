module.exports = function handler(req, res) {
  const code = ((req.query.c || '')).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const benefit = req.query.b || '';

  if (!code) { res.status(400).send('Código no válido'); return; }

  // og:image usa el mismo dominio radissonpuertovaras.com para que WhatsApp lo muestre
  const ogImage = `https://www.radissonpuertovaras.com/ticketera/api/qr-image?c=${encodeURIComponent(code)}`;
  const displayImg = `https://ticketera-balandra.vercel.app/api/qr-image?c=${encodeURIComponent(code)}`;
  const title = 'Ticket de regalo · Balandra';
  const registerUrl = 'https://www.radissonpuertovaras.com/ticketera/registro.html?r=bal';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="Muestra este QR al mesero en Balandra Restaurant · Radisson Puerto Varas">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="400">
<meta property="og:image:height" content="400">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${ogImage}">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0a1628;min-height:100vh;display:flex;flex-direction:column;align-items:center;font-family:sans-serif;padding:24px 20px 40px;gap:18px}
.lbl{color:rgba(212,175,55,.6);font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-top:8px}
.qr{background:#fff;border-radius:18px;padding:14px;box-shadow:0 0 50px rgba(212,175,55,.2)}
.qr img{display:block;width:240px;height:240px;border-radius:6px}
.benefit{color:#D4AF37;font-size:16px;font-weight:700;text-align:center;max-width:260px;line-height:1.4}
.code{color:rgba(255,255,255,.2);font-size:11px;font-family:monospace;letter-spacing:3px}
.inst{color:rgba(255,255,255,.4);font-size:12px;text-align:center;max-width:240px;line-height:1.6}
.divider{width:100%;max-width:280px;height:1px;background:rgba(255,255,255,.08);margin:4px 0}
.promo{background:rgba(212,175,55,.06);border:1px solid rgba(212,175,55,.18);border-radius:14px;padding:20px 18px;max-width:280px;text-align:center;display:flex;flex-direction:column;gap:12px}
.promo-title{color:var(--gold,#D4AF37);font-size:13px;font-weight:700;line-height:1.4}
.promo-desc{color:rgba(255,255,255,.45);font-size:11px;line-height:1.6}
.promo-btn{display:block;padding:12px 20px;background:#D4AF37;color:#0a1628;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;letter-spacing:.5px;text-transform:uppercase}
</style>
</head>
<body>
<p class="lbl">Balandra · Radisson Puerto Varas</p>
<div class="qr"><img src="${displayImg}" alt="QR"></div>
${benefit ? `<p class="benefit">${benefit}</p>` : ''}
<p class="code">${code}</p>
<p class="inst">Muestra este QR al mesero antes de pedir la cuenta.<br>Solo un uso.</p>
<div class="divider"></div>
<div class="promo">
  <p class="promo-title">🎁 ¿Te gustó este beneficio?</p>
  <p class="promo-desc">Obtén tu propia Ticketera Digital con 10 descuentos y beneficios exclusivos en Balandra Restaurant · Radisson Puerto Varas.</p>
  <a class="promo-btn" href="${registerUrl}">Quiero mi Ticketera →</a>
</div>
</body>
</html>`);
};
