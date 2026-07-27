import { toast } from "sonner";

/**
 * Copies a same-page section link to the clipboard, announces the result
 * via an accessible sonner toast, and updates the URL hash so the browser
 * back button / share preview reflect the anchor.
 *
 * Uses `navigator.clipboard.writeText` when available and permitted, with a
 * `document.execCommand("copy")` fallback for restricted contexts. If both
 * paths fail (permission denied, insecure origin, etc.) the toast surfaces
 * the URL so the user can copy it manually.
 */
export async function copySectionLink(
  id: string,
  label?: string,
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const url = `${window.location.origin}${window.location.pathname}#${id}`;
  const description = label ?? url;

  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied) {
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      copied = document.execCommand("copy");
      document.body.removeChild(ta);
    } catch {
      copied = false;
    }
  }

  if (typeof history !== "undefined" && history.replaceState) {
    history.replaceState(null, "", `#${id}`);
  }

  if (copied) {
    toast.success("Section link copied", { description });
  } else {
    toast.error("Couldn’t copy — copy this link manually", {
      description: url,
      duration: 8000,
    });
  }
  return copied;
}