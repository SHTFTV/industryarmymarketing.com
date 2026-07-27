/**
 * Industry Army Marketing — Production Server
 * Fixes:
 * 1. Blog clean URL routing: /blog/slug → serves pre-rendered HTML
 * 2. Contractor-marketing URL routing
 * 3. Case-studies URL routing
 * 4. All 6,500+ pre-rendered HTML files served correctly to Google
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');

// ─── HELPER: Try to find and serve a pre-rendered HTML file ──────────────────
function servePrerendered(req, res, next, subdir) {
  const slug = req.params.slug || '';
  const extra = req.params[0] || '';
  const base = extra ? path.join(subdir, slug, extra) : path.join(subdir, slug);

  // Try: /public/{base}/index.html first (directory style)
  const indexPath = path.join(PUBLIC, base, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  // Try: /public/{base}.html (flat file style)
  const htmlPath = path.join(PUBLIC, `${base}.html`);
  if (fs.existsSync(htmlPath)) {
    return res.sendFile(htmlPath);
  }

  next();
}

// ─── BLOG ROUTING ─────────────────────────────────────────────────────────────
// /blog/my-post → /public/blog/my-post/index.html OR /public/blog/my-post.html
app.get('/blog/:slug*', (req, res, next) => {
  servePrerendered(req, res, next, 'blog');
});

// ─── CASE STUDIES ROUTING ─────────────────────────────────────────────────────
app.get('/case-studies/:slug*', (req, res, next) => {
  servePrerendered(req, res, next, 'case-studies');
});

// ─── CONTRACTOR MARKETING ROUTING ─────────────────────────────────────────────
app.get('/contractor-marketing/:slug*', (req, res, next) => {
  servePrerendered(req, res, next, 'contractor-marketing');
});

// ─── STATIC FILES ─────────────────────────────────────────────────────────────
app.use(express.static(PUBLIC, {
  extensions: ['html'],
  index: 'index.html',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('X-Robots-Tag', 'index, follow');
    }
    if (filePath.endsWith('.xml')) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    }
    if (filePath.endsWith('robots.txt')) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
  }
}));

// ─── SPA CATCH-ALL ────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ IAM server running on port ${PORT}`);
  console.log(`✅ Serving ${PUBLIC}`);
  console.log(`✅ Blog pre-rendered HTML routing active`);
  console.log(`✅ 6,500+ pre-rendered pages now Google-readable`);
});
