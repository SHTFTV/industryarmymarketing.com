import { useEffect } from "react";

interface Props {
  src: string;
  title: string;
}

/**
 * Renders a full-viewport iframe of a static HTML file shipped in /public.
 * Lets us serve hand-authored long-form posts at clean React Router URLs
 * while preserving the exact HTML/CSS/JSON-LD word-for-word.
 */
const StaticHtmlPage = ({ src, title }: Props) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);

  return (
    <iframe
      src={src}
      title={title}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        background: "#fff",
      }}
    />
  );
};

export default StaticHtmlPage;