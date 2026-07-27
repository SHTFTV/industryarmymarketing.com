import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Seo from "@/components/Seo";

interface FeedItem {
  title: string;
  link: string;
  guid: string;
  pubDate: string;
  category: string;
  description: string;
  enclosureUrl?: string;
  enclosureType?: string;
  enclosureLength?: string;
}

interface ValidationResult {
  errors: string[];
  warnings: string[];
}

function validateRss(xml: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const need = (re: RegExp, where: string, label: string) => {
    if (!re.test(where)) errors.push(`Missing required ${label}`);
  };

  if (!/^<\?xml\s+version="1\.0"\s+encoding="UTF-8"\?>/.test(xml.trim())) {
    errors.push('XML declaration must be <?xml version="1.0" encoding="UTF-8"?>');
  }
  if (!/<rss[^>]+version="2\.0"/.test(xml)) errors.push('<rss> must declare version="2.0"');
  if (!/xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/.test(xml)) {
    warnings.push('Missing xmlns:atom — required for <atom:link rel="self">');
  }

  const channelMatch = xml.match(/<channel>([\s\S]*?)<\/channel>/);
  if (!channelMatch) {
    errors.push("Missing <channel>");
    return { errors, warnings };
  }
  const channel = channelMatch[1];
  need(/<title>[^<]+<\/title>/, channel, "channel <title>");
  need(/<link>https?:\/\/[^<]+<\/link>/, channel, "channel <link> (absolute URL)");
  need(/<description>[^<]+<\/description>/, channel, "channel <description>");
  need(/<language>[a-z]{2}(-[a-z]{2})?<\/language>/i, channel, "channel <language>");
  need(/<lastBuildDate>[^<]+<\/lastBuildDate>/, channel, "channel <lastBuildDate>");
  need(
    /<atom:link[^>]+rel="self"[^>]+type="application\/rss\+xml"[^>]*\/>/,
    channel,
    'channel <atom:link rel="self">',
  );

  const imageMatch = channel.match(/<image>([\s\S]*?)<\/image>/);
  if (!imageMatch) {
    errors.push("Missing channel <image> block");
  } else {
    const image = imageMatch[1];
    need(/<url>https?:\/\/[^<]+<\/url>/, image, "image <url>");
    need(/<title>[^<]+<\/title>/, image, "image <title>");
    need(/<link>https?:\/\/[^<]+<\/link>/, image, "image <link>");
  }

  const lbd = channel.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/);
  if (lbd && Number.isNaN(Date.parse(lbd[1]))) {
    errors.push(`channel <lastBuildDate> is not a valid RFC-822 date: "${lbd[1]}"`);
  }

  const items = [...channel.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  if (items.length === 0) errors.push("Feed contains zero <item> entries");

  const guids = new Set<string>();
  items.forEach((item, idx) => {
    const where = `item[${idx}]`;
    if (!item.match(/<title>([^<]+)<\/title>/)) errors.push(`${where}: missing <title>`);
    if (!item.match(/<link>(https?:\/\/[^<]+)<\/link>/)) errors.push(`${where}: missing absolute <link>`);
    if (!item.match(/<description>([\s\S]*?)<\/description>/)) errors.push(`${where}: missing <description>`);

    const guid = item.match(/<guid(?:\s+isPermaLink="(true|false)")?>([^<]+)<\/guid>/);
    if (!guid) {
      errors.push(`${where}: missing <guid>`);
    } else {
      const value = guid[2];
      if (guids.has(value)) errors.push(`${where}: duplicate GUID "${value}"`);
      guids.add(value);
      if (guid[1] === "true" && !/^https?:\/\//.test(value)) {
        errors.push(`${where}: <guid isPermaLink="true"> must be an absolute URL`);
      }
    }

    const pub = item.match(/<pubDate>([^<]+)<\/pubDate>/);
    if (!pub) {
      errors.push(`${where}: missing <pubDate>`);
    } else if (Number.isNaN(Date.parse(pub[1]))) {
      errors.push(`${where}: <pubDate> is not a valid RFC-822 date: "${pub[1]}"`);
    }

    const enc = item.match(
      /<enclosure\s+url="(https?:\/\/[^"]+)"\s+length="(\d+)"\s+type="([^"]+)"\s*\/>/,
    );
    if (!enc) {
      errors.push(`${where}: missing or malformed <enclosure url length type />`);
    } else {
      if (Number(enc[2]) <= 0) errors.push(`${where}: enclosure length must be > 0`);
      if (!/^\w+\/[\w.+-]+$/.test(enc[3])) {
        errors.push(`${where}: enclosure type "${enc[3]}" is not a MIME type`);
      }
    }
  });

  return { errors, warnings };
}

function parseItems(xml: string): FeedItem[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  const pick = (s: string, tag: string) => {
    const m = s.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return m ? m[1].trim() : "";
  };
  return items.map((s) => {
    const enc = s.match(/<enclosure\s+url="([^"]+)"\s+length="(\d+)"\s+type="([^"]+)"\s*\/>/);
    return {
      title: pick(s, "title"),
      link: pick(s, "link"),
      guid: pick(s, "guid"),
      pubDate: pick(s, "pubDate"),
      category: pick(s, "category"),
      description: pick(s, "description"),
      enclosureUrl: enc?.[1],
      enclosureLength: enc?.[2],
      enclosureType: enc?.[3],
    };
  });
}

const RssPreview = () => {
  const [xml, setXml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/rss.xml", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(setXml)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const { errors, warnings } = xml ? validateRss(xml) : { errors: [], warnings: [] };
  const items = xml ? parseItems(xml) : [];
  const status = errors.length === 0 ? "PASS" : "FAIL";
  const statusColor =
    errors.length === 0
      ? "text-primary border-primary"
      : "text-destructive border-destructive";

  return (
    <Layout>
      <Seo
        title="RSS Preview — Industry Army Marketing"
        description="Internal preview of /rss.xml output with validator warnings and item-by-item inspection."
        path="/rss-preview"
      />
      <PageHeader
        eyebrow="Internal · Pre-publish"
        title="RSS"
        highlight="Preview"
        description="Inspect the live /rss.xml output and surface validator errors and warnings before shipping."
      />
      <section className="container mx-auto px-4 py-14 space-y-10">
        {loading && <p className="text-muted-foreground">Loading /rss.xml…</p>}
        {error && (
          <div className="border border-destructive/40 bg-destructive/5 text-destructive p-4 rounded-md">
            Failed to fetch /rss.xml: {error}
          </div>
        )}
        {!loading && !error && (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 border uppercase tracking-widest text-xs font-bold ${statusColor}`}>
                {status}
              </span>
              <span className="text-muted-foreground text-sm">
                {items.length} item{items.length === 1 ? "" : "s"} · {errors.length} error
                {errors.length === 1 ? "" : "s"} · {warnings.length} warning
                {warnings.length === 1 ? "" : "s"}
              </span>
              <a
                href="/rss.xml"
                className="text-primary hover:underline text-sm ml-auto"
              >
                Open raw /rss.xml →
              </a>
            </div>

            {errors.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-destructive mb-3">Errors</h2>
                <ul className="space-y-1 text-sm text-destructive">
                  {errors.map((e, i) => (
                    <li key={i} className="font-mono">— {e}</li>
                  ))}
                </ul>
              </div>
            )}

            {warnings.length > 0 && (
              <div>
                <h2 className="font-display text-2xl text-foreground mb-3">Warnings</h2>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {warnings.map((w, i) => (
                    <li key={i} className="font-mono">— {w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="font-display text-2xl text-foreground mb-4">Items</h2>
              <div className="grid gap-4">
                {items.map((it, i) => (
                  <article
                    key={it.guid || i}
                    className="border border-border rounded-md p-4 bg-card/40"
                  >
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-xs text-muted-foreground font-mono">#{i + 1}</span>
                      <h3 className="font-display text-xl text-foreground">{it.title}</h3>
                      {it.category && (
                        <span className="text-[10px] uppercase tracking-widest text-primary border border-primary/40 px-2 py-0.5">
                          {it.category}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">{it.description}</p>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono mt-3 text-muted-foreground">
                      <div><dt className="inline text-foreground">link: </dt><dd className="inline break-all">{it.link}</dd></div>
                      <div><dt className="inline text-foreground">guid: </dt><dd className="inline break-all">{it.guid}</dd></div>
                      <div><dt className="inline text-foreground">pubDate: </dt><dd className="inline">{it.pubDate}</dd></div>
                      <div>
                        <dt className="inline text-foreground">enclosure: </dt>
                        <dd className="inline break-all">
                          {it.enclosureUrl
                            ? `${it.enclosureType} · ${it.enclosureLength}B · ${it.enclosureUrl}`
                            : "—"}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>

            <details className="border border-border rounded-md">
              <summary className="cursor-pointer px-4 py-3 text-sm uppercase tracking-widest text-foreground">
                Raw XML
              </summary>
              <pre className="text-xs font-mono p-4 overflow-x-auto whitespace-pre-wrap break-all text-muted-foreground">
                {xml}
              </pre>
            </details>
          </>
        )}
      </section>
    </Layout>
  );
};

export default RssPreview;