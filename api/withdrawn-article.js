export default function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
  return res.status(410).send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Article removed | Industry Army Marketing</title><style>body{margin:0;background:#102218;color:#f5f4e9;font:18px/1.6 Arial,sans-serif}main{max-width:48rem;margin:12vh auto;padding:24px}a{color:#d5ef77}h1{font-size:clamp(2rem,7vw,3.5rem);line-height:1.1}</style></head><body><main><p>INDUSTRY ARMY MARKETING</p><h1>This article has been removed.</h1><p>The requested article is no longer available.</p><p><a href="/blog">Read the build journal</a></p></main></body></html>`);
}
