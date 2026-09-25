import { useEffect } from "react";
import { getCustomMetaScript } from "../api/settingApi";

// Ensure Facebook Pixel queue stub is safely defined on window so fbq calls never throw ReferenceError
const ensureFbqStub = () => {
  if (typeof window !== "undefined" && typeof window.fbq === "undefined") {
    const n = (window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
  }
};

const CustomMetaScript = () => {
  useEffect(() => {
    let mounted = true;

    const loadCustomScript = async () => {
      try {
        ensureFbqStub();
        const scriptContent = await getCustomMetaScript();
        if (!scriptContent || !mounted || typeof scriptContent !== "string") return;

        const trimmed = scriptContent.trim();
        if (!trimmed) return;

        // Parse HTML to extract scripts and noscript tags safely
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, "text/html");
        const scripts = doc.querySelectorAll("script");

        if (scripts.length > 0) {
          scripts.forEach((scriptElement) => {
            if (scriptElement.src) {
              const script = document.createElement("script");
              Array.from(scriptElement.attributes).forEach((attr) => {
                script.setAttribute(attr.name, attr.value);
              });
              script.onerror = (err) => console.warn("Custom Meta Script external load error:", err);
              document.head.appendChild(script);
            } else {
              const code = scriptElement.textContent || scriptElement.innerText || "";
              if (code.trim()) {
                try {
                  // Execute safely via Function constructor so syntax errors are caught cleanly
                  const runScript = new Function(code);
                  runScript();
                } catch (err) {
                  console.warn("Custom Meta Script execution error:", err);
                }
              }
            }
          });
        } else {
          // If no <script> tags found, check if it's pure HTML (e.g. <noscript> or comments)
          if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
            // Pure markup without script tags, do not execute as JS
            return;
          }

          // Otherwise attempt safe execution as raw JavaScript
          try {
            const runScript = new Function(trimmed);
            runScript();
          } catch (err) {
            console.warn("Custom Meta Script execution error:", err);
          }
        }
      } catch (err) {
        console.warn("Custom Meta Script load error:", err);
      }
    };

    loadCustomScript();

    return () => {
      mounted = false;
    };
  }, []);

  return null; // This component renders nothing visually
};

export default CustomMetaScript;

