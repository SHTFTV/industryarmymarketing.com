import { useEffect } from "react";
import Seo from "@/components/Seo";

interface Props {
  src: string;
  title: string;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  jsonLd?: object | object[];
}

/**
 * Renders a full-viewport iframe of a static HTML file shipped in /public.
 * Lets us serve hand-authored long-form posts at clean React Router URLs
 * while preserving the exact HTML/CSS/JSON-LD word-for-word.
 */
const StaticHtmlPage = ({ src, title, description, path, image, imageAlt, jsonLd }: Props) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);

  return (
    <>
      {path && description && (
        <Seo
          title={title}
          description={description}
          path={path}
          type="article"
          image={image}
          imageAlt={imageAlt}
          jsonLd={jsonLd}
        />
      )}
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
    </>
  );
};

export default StaticHtmlPage;