import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";

/** Render source Markdown as React nodes. Raw HTML is never interpreted. */
export default function BlogMarkdown({ text, footnoteIds = [] }: { text: string; footnoteIds?: string[] }) {
  const prepared = text.replace(/\[\^([a-z0-9_-]+)\]/gi, (original, id: string) => {
    const number = footnoteIds.indexOf(id) + 1;
    return number > 0 ? `[${number}](#fn-${id})` : original;
  });
  const components: Components = {
    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>,
    h1: ({ children }) => <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">{children}</h3>,
    h2: ({ children }) => <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">{children}</h3>,
    h3: ({ children }) => <h3 className="mb-3 mt-6 text-xl font-semibold text-foreground">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-3 mt-5 font-semibold text-foreground">{children}</h4>,
    a: ({ href, children }) => {
      if (href?.startsWith("#fn-") && footnoteIds.includes(href.slice(4))) {
        const id = href.slice(4);
        const number = footnoteIds.indexOf(id) + 1;
        return <sup><a href={href} id={`fnref-${id}`} aria-label={`Footnote ${number}`} className="ml-0.5 px-1 text-primary">{children}</a></sup>;
      }
      const external = /^https?:\/\//i.test(href ?? "");
      return <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-primary underline underline-offset-2 hover:text-primary/80">{children}</a>;
    },
    // Source text must not inject arbitrary tracking/media assets into paragraph blocks.
    img: () => null,
  };
  const markdown = (value: string) => <ReactMarkdown skipHtml components={components}>{value}</ReactMarkdown>;
  const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, "|"));
  const lines = prepared.split("\n");
  const blocks: React.ReactNode[] = [];
  let plain: string[] = [];
  const flush = () => {
    if (plain.length) blocks.push(<div key={`text-${blocks.length}`}>{markdown(plain.join("\n"))}</div>);
    plain = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const header = cells(lines[i]);
    const separator = i + 1 < lines.length ? cells(lines[i + 1]) : [];
    const isTable = lines[i].includes("|") && header.length > 1 && separator.length === header.length && separator.every((cell) => /^:?-{3,}:?$/.test(cell));
    if (!isTable) { plain.push(lines[i]); continue; }
    flush();
    const rows: string[][] = [];
    i += 2;
    while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
      rows.push(cells(lines[i]));
      i++;
    }
    i--;
    blocks.push(
      <div key={`table-${blocks.length}`} className="mb-5 max-w-full overflow-x-auto rounded border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted/40"><tr>{header.map((cell, j) => <th key={j} scope="col" className="border-b border-border px-3 py-2 font-semibold text-foreground">{markdown(cell)}</th>)}</tr></thead>
          <tbody>{rows.map((row, j) => <tr key={j}>{header.map((_, k) => <td key={k} className="border-b border-border px-3 py-2 align-top">{markdown(row[k] ?? "")}</td>)}</tr>)}</tbody>
        </table>
      </div>,
    );
  }
  flush();
  return <>{blocks}</>;
}
