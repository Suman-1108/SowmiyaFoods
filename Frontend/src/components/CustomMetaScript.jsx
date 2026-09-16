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
        if (!scriptContent || !mounted) return;

        // Parse the script content to handle both inline and external scripts
        const parser = new DOMParser();
        const doc = parser.parseFromString(scriptContent, "text/html");
        const scripts = doc.querySelectorAll("script");

        if (scripts.length > 0) {
          scripts.forEach((scriptElement) => {
            const script = document.createElement("script");

            // Copy all attributes (like src, async, defer, etc.)
            Array.from(scriptElement.attributes).forEach((attr) => {
              script.setAttribute(attr.name, attr.value);
            });

            // If it's an inline script (no src), wrap execution safely
            if (!scriptElement.src && scriptElement.innerHTML) {
              script.textContent = `
                try {
                  ${scriptElement.innerHTML}
                } catch (err) {
                  console.warn("Custom Meta Script execution error:", err);
                }
              `;
            }

            document.head.appendChild(script);
          });
        } else {
          // If no script tags were found, treat the entire content as inline script
          const script = document.createElement("script");
          script.textContent = `
            try {
              ${scriptContent}
            } catch (err) {
              console.warn("Custom Meta Script execution error:", err);
            }
          `;
          document.head.appendChild(script);
        }
      } catch (_) {
        // Silently ignore if custom script is not configured or optional
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
