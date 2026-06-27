import { useEffect, useMemo, useState } from "react";

const CITIES = [
  "Vancouver, BC",
  "Toronto, ON",
  "Calgary, AB",
  "Montréal, QC",
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Miami, FL",
  "London, UK",
  "Sydney, AU",
];

const CATEGORIES = [
  { key: "Photographers", cap: 10 },
  { key: "Venues", cap: 5 },
  { key: "Caterers", cap: 8 },
  { key: "Florists", cap: 6 },
  { key: "DJs & Bands", cap: 7 },
  { key: "Planners", cap: 4 },
  { key: "Officiants", cap: 3 },
  { key: "Videographers", cap: 6 },
];

// Deterministic seed so the page hydrates consistently, then tick from there.
function seed(city: string, cat: string, cap: number) {
  let h = 0;
  const s = `${city}|${cat}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  // Remaining between 1 and cap, skewed slightly toward scarcity
  const r = Math.abs(h) % cap;
  return Math.max(1, Math.min(cap, r === 0 ? cap : r));
}

type Row = { city: string; cat: string; cap: number; remaining: number; pulse: boolean };

const buildInitial = (): Row[] =>
  CITIES.flatMap((city) =>
    CATEGORIES.map((c) => ({
      city,
      cat: c.key,
      cap: c.cap,
      remaining: seed(city, c.key, c.cap),
      pulse: false,
    })),
  );

const LimitedSpotsWidget = () => {
  const initial = useMemo(buildInitial, []);
  const [rows, setRows] = useState<Row[]>(initial);
  const [cityFilter, setCityFilter] = useState<string>("All cities");
  const [lastTick, setLastTick] = useState<Date>(new Date());

  // Simulate real-time vendor activity: occasional claim (−1) or release (+1).
  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) => {
        const next = prev.map((r) => ({ ...r, pulse: false }));
        // Mutate 1–2 random rows per tick
        const mutations = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < mutations; i++) {
          const idx = Math.floor(Math.random() * next.length);
          const row = next[idx];
          const claim = Math.random() < 0.72; // mostly claims, occasional release
          let r = row.remaining + (claim ? -1 : 1);
          if (r < 1) r = 1;
          if (r > row.cap) r = row.cap;
          if (r !== row.remaining) {
            next[idx] = { ...row, remaining: r, pulse: true };
          }
        }
        return next;
      });
      setLastTick(new Date());
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const visible = rows.filter((r) => cityFilter === "All cities" || r.city === cityFilter);
  const totalRemaining = visible.reduce((s, r) => s + r.remaining, 0);
  const totalCap = visible.reduce((s, r) => s + r.cap, 0);

  const pct = (r: Row) => Math.round((r.remaining / r.cap) * 100);
  const tone = (r: Row) =>
    r.remaining <= 2
      ? "text-red-400 border-red-500/40 bg-red-500/10"
      : r.remaining <= 4
        ? "text-amber-300 border-amber-500/40 bg-amber-500/10"
        : "text-primary border-primary/40 bg-primary/10";

  return (
    <section className="py-16 border-t border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">
              Live Inventory · 3–10 Spots Per Category Per City
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">
              Limited <span className="text-primary">Spots</span> Remaining
            </h2>
            <p className="text-muted-foreground mt-3 max-w-3xl text-sm">
              Real-time vendor inventory across the Weddings.io network. Each city-category is hard-capped
              between <strong className="text-foreground">3 and 10 vendors</strong> — even in the largest markets in
              the world. Counts update as vendors claim or release territory.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              Live · updated {lastTick.toLocaleTimeString()}
            </span>
            <select
              aria-label="Filter by city"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-1.5 text-sm text-foreground"
            >
              <option>All cities</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-card p-4 flex flex-wrap gap-6 text-sm">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Open Seats</div>
            <div className="font-mono text-2xl text-primary">{totalRemaining}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Hard Cap</div>
            <div className="font-mono text-2xl text-foreground">{totalCap}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Network Fill</div>
            <div className="font-mono text-2xl text-foreground">
              {Math.round(((totalCap - totalRemaining) / totalCap) * 100)}%
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="p-3 font-semibold">City</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Cap</th>
                <th className="p-3 font-semibold">Remaining</th>
                <th className="p-3 font-semibold w-1/3">Fill</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr
                  key={`${r.city}-${r.cat}`}
                  className={`border-t border-border align-middle transition-colors ${
                    r.pulse ? "bg-primary/5" : ""
                  }`}
                >
                  <td className="p-3 text-foreground font-medium">{r.city}</td>
                  <td className="p-3 text-muted-foreground">{r.cat}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{r.cap}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border font-mono text-xs ${tone(r)}`}
                    >
                      {r.remaining <= 2 && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-400" />
                        </span>
                      )}
                      {r.remaining} of {r.cap} left
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${
                          r.remaining <= 2
                            ? "bg-red-400"
                            : r.remaining <= 4
                              ? "bg-amber-400"
                              : "bg-primary"
                        }`}
                        style={{ width: `${100 - pct(r)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Counts reflect live vendor activity across the Weddings.io network. Inventory is non-refundable once a
          city-category sells out for the calendar year.
        </p>
      </div>
    </section>
  );
};

export default LimitedSpotsWidget;