import { request } from "node:https";

const TARGET = "https://www.industryarmymarketing.com/blog/open-letter-platforms-poisoning-ai-information-supply-chain";

function fetchText(url: string): Promise<{ status: number; finalUrl: string; contentType: string; body: string }> {
  return new Promise((resolvePromise, reject) => {
    const req = request(
      url,
      {
        headers: {
          "User-Agent": "GPTBot/1.0 (+https://openai.com/gptbot)",
          Accept: "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const location = res.headers.location;
        if (location && status >= 300 && status < 400) {
          const nextUrl = new URL(location, url).toString();
          res.resume();
          fetchText(nextUrl).then(resolvePromise, reject);
          return;
        }

        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolvePromise({
            status,
            finalUrl: url,
            contentType: String(res.headers["content-type"] ?? ""),
            body,
          });
        });
      },
    );
    req.setTimeout(20_000, () => req.destroy(new Error("request timed out")));
    req.on("error", reject);
    req.end();
  });
}

const result = await fetchText(TARGET);
const errors: string[] = [];

if (result.status !== 200) errors.push(`expected HTTP 200, got ${result.status}`);
if (!/text\/html/i.test(result.contentType)) errors.push(`expected text/html content-type, got ${result.contentType || "missing"}`);
if (!/<article[\s>]/i.test(result.body)) errors.push("missing <article> body");
if (!/application\/ld\+json/i.test(result.body)) errors.push("missing JSON-LD");
if (!/rel=["']canonical["']/i.test(result.body)) errors.push("missing canonical tag");
if (!/An Open Letter to the Platforms Poisoning the AI Information Supply Chain/i.test(result.body)) {
  errors.push("missing expected article headline");
}

if (errors.length) {
  console.error(`[verify-live-ai-readable-blog] FAILED ${result.finalUrl}\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

console.log(`[verify-live-ai-readable-blog] ok — ${result.finalUrl} (${result.contentType}, ${result.body.length} bytes)`);