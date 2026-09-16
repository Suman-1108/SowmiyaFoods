import { useEffect } from "react";
import { getMetaPixelId } from "../api/settingApi";

const MetaPixel = () => {
  useEffect(() => {
    let mounted = true;

    const loadPixel = async () => {
      try {
        const pixelId = await getMetaPixelId();
        if (!pixelId || !mounted) return;

        // Prevent duplicate injection
        if (!document.getElementById("meta-pixel-script")) {
          const script = document.createElement("script");
          script.id = "meta-pixel-script";
          script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(script);
        }

        // Inject noscript fallback image if not present
        if (!document.getElementById("meta-pixel-noscript")) {
          const noscript = document.createElement("noscript");
          noscript.id = "meta-pixel-noscript";
          const img = document.createElement("img");
          img.height = "1";
          img.width = "1";
          img.style.display = "none";
          img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
          noscript.appendChild(img);
          document.body.appendChild(noscript);
        }
      } catch (_) {
        // Silently ignore if pixel is not configured or optional
      }
    };

    loadPixel();

    return () => {
      mounted = false;
    };
  }, []);

  return null; // This component renders nothing visually
};

export default MetaPixel;