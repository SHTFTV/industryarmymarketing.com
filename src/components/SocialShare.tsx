import { useState } from "react";
import { Link2, Check, Twitter, Linkedin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SocialShare({ url, title, description, className }: Props) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description ?? "");

  const links = [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      Icon: Twitter,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: Linkedin,
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      Icon: Facebook,
    },
  ];

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}
      role="group"
      aria-label="Share this article"
    >
      <span className="text-primary text-[10px] uppercase tracking-[0.3em] mr-1">Share</span>
      {links.map(({ label, href, Icon }) => (
        <Button
          key={label}
          asChild
          size="icon"
          variant="outline"
          aria-label={label}
          title={label}
        >
          <a href={href} target="_blank" rel="noopener noreferrer">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
      ))}
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={onCopy}
        aria-label="Copy link"
        title={copied ? "Link copied" : "Copy link"}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}