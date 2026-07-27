import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installIamFloaterLoader } from "./lib/iamFloaterLoader";

installIamFloaterLoader();

const rootEl = document.getElementById("root")!;
const tree = (
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
// react-snap pre-renders each route to static HTML at build time.
// If the root already has children, hydrate the existing markup;
// otherwise render from scratch (dev, non-prerendered routes).
if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, tree);
} else {
  createRoot(rootEl).render(tree);
}
