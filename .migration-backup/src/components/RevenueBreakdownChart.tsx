import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Hardcoded projected mix for a steady-state month at ~1,500 paying territories.
// Values are USD/month and are illustrative for the investor narrative, not GAAP.
const data = [
  { name: "Territory Subscriptions", value: 18500, color: "hsl(var(--primary))", note: "Recurring · $10/mo slots" },
  { name: "App Sales",               value: 9200,  color: "#34d399",            note: "Flagship app portfolio" },
  { name: "Content & Backlinks",     value: 6400,  color: "#fbbf24",            note: "$10/post · uncapped volume" },
  { name: "Listing Fees",            value: 4200,  color: "#60a5fa",            note: "$10 one-time onboarding" },
];

const total = data.reduce((s, d) => s + d.value, 0);
const fmt = (n: number) => `$${n.toLocaleString()}`;

const RevenueBreakdownChart = () => (
  <section className="py-20 border-t border-border">
    <div className="container mx-auto px-4 max-w-6xl">
      <p className="text-primary uppercase tracking-[0.3em] text-xs font-semibold mb-3">Revenue Breakdown</p>
      <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">
        Projected Monthly Mix <span className="text-primary text-glow">— Steady State</span>
      </h2>
      <p className="text-muted-foreground mb-10 max-w-3xl text-sm">
        Illustrative blended monthly revenue at ~1,500 paying territories across the IAM network. Recurring streams
        anchor the base; app sales and content layer on compounding upside.
      </p>

      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div className="bg-card border border-border rounded-lg p-6 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={2}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(v: number, n: string) => [`${fmt(v)} · ${Math.round((v / total) * 100)}%`, n]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v / 1000}k`} fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={150} fontSize={11} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                formatter={(v: number) => [fmt(v), "Monthly"]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {data.map((d) => (
          <div key={d.name} className="p-5 rounded-md bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{d.name}</span>
            </div>
            <p className="font-display text-3xl text-foreground">{fmt(d.value)}<span className="text-muted-foreground text-base">/mo</span></p>
            <p className="text-xs text-primary mt-1">{Math.round((d.value / total) * 100)}% of mix</p>
            <p className="text-xs text-muted-foreground mt-2">{d.note}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-6">
        Total projected blended monthly revenue: <strong className="text-foreground">{fmt(total)}</strong> · ~{fmt(total * 12)} ARR.
        Figures are illustrative model outputs, not financial guidance.
      </p>
    </div>
  </section>
);

export default RevenueBreakdownChart;