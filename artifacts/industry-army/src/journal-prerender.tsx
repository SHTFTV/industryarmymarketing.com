import { renderToString } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
export function render(path:string) { const context: Record<string, any> = {}; const html=renderToString(<HelmetProvider context={context}><App ssrPath={path}/></HelmetProvider>); return {html,head:context.helmet}; }
