import { useState, useEffect, useRef, useCallback } from "react";

const META_APP_ID = import.meta.env.VITE_META_APP_ID || "1439250928222462";
const EMBEDDED_SIGNUP_CONFIG_ID = import.meta.env.VITE_EMBEDDED_SIGNUP_CONFIG_ID || "1356134949223143";

/**
 * Custom hook to load Facebook JS SDK and launch Meta WhatsApp Embedded Signup (v4)
 * Supports Business App Coexistence onboarding.
 */
export const useWhatsappEmbeddedSignup = () => {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelled, setCancelled] = useState(false);

  const sessionInfoRef = useRef(null);
  const authCodeRef = useRef(null);
  const callbackTriggeredRef = useRef(false);
  const timeoutIdRef = useRef(null);
  const messageListenerRef = useRef(null);

  // Initialize Facebook JS SDK asynchronously
  useEffect(() => {
    const initFb = () => {
      if (window.FB && typeof window.FB.init === "function") {
        try {
          window.FB.init({
            appId: META_APP_ID,
            autoLogAppEvents: true,
            xfbml: true,
            version: "v22.0",
          });
          setIsSdkLoaded(true);
        } catch (e) {
          console.warn("FB.init warning:", e);
        }
      }
    };

    if (window.FB) {
      initFb();
      return;
    }

    window.fbAsyncInit = function () {
      initFb();
    };

    // Load FB SDK script if not already added
    if (!document.getElementById("facebook-jssdk")) {
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.async = true;
      js.defer = true;
      js.onerror = () => {
        console.error("Failed to load Facebook SDK script");
        setError("Failed to load Facebook SDK. Please check your internet connection or disable ad-blockers.");
      };
      document.body.appendChild(js);
    }
  }, []);

  // Cleanup message event listener and timers on unmount
  useEffect(() => {
    return () => {
      if (messageListenerRef.current) {
        window.removeEventListener("message", messageListenerRef.current);
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  /**
   * Launch Meta WhatsApp Embedded Signup (v4) flow
   * @param {Function} onSuccessCallback Function to call with { code, wabaId, phoneNumberId, businessId }
   */
  const launchEmbeddedSignup = useCallback(
    (onSuccessCallback) => {
      setError(null);
      setCancelled(false);

      if (!window.FB || typeof window.FB.login !== "function") {
        setLoading(false);
        setError("Facebook SDK is not loaded yet. Please check your internet connection or ad-blocker and refresh.");
        return;
      }

      // Ensure FB.init has been executed before calling FB.login
      try {
        window.FB.init({
          appId: META_APP_ID,
          autoLogAppEvents: true,
          xfbml: true,
          version: "v22.0",
        });
      } catch (e) {
        console.warn("[WhatsApp Embedded Signup] FB.init re-init notice:", e);
      }

      setLoading(true);
      sessionInfoRef.current = null;
      authCodeRef.current = null;
      callbackTriggeredRef.current = false;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

      /**
       * Coordinates submission to backend once both auth code and session info have arrived
       */
      const trySubmitPayload = () => {
        if (callbackTriggeredRef.current) return;
        if (!authCodeRef.current) return;

        const sessionData = sessionInfoRef.current || {};
        
        callbackTriggeredRef.current = true;
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        const payload = {
          code: authCodeRef.current,
          wabaId: sessionData.waba_id || null,
          phoneNumberId: sessionData.phone_number_id || null,
          businessId: sessionData.business_id || null,
        };

        console.log("[WhatsApp Embedded Signup] Submitting payload to backend:", payload);

        if (onSuccessCallback) {
          Promise.resolve(onSuccessCallback(payload))
            .catch((err) => {
              setError(err.message || "Failed to complete onboarding on server.");
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }

        if (messageListenerRef.current) {
          window.removeEventListener("message", messageListenerRef.current);
          messageListenerRef.current = null;
        }
      };

      // Register postMessage handler for Meta Embedded Signup session data
      const messageHandler = (event) => {
        if (
          event.origin !== "https://www.facebook.com" &&
          event.origin !== "https://web.facebook.com"
        ) {
          return;
        }

        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

          if (data && data.type === "WA_EMBEDDED_SIGNUP") {
            console.log("[WhatsApp Embedded Signup Event]", JSON.stringify(data, null, 2));
            if (
              data.event === "FINISH" ||
              data.event === "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING"
            ) {
              sessionInfoRef.current = data.data;
              // If auth code is already available, submit immediately
              if (authCodeRef.current) {
                trySubmitPayload();
              }
            } else if (data.event === "CANCEL") {
              setCancelled(true);
              setLoading(false);
            } else if (data.event === "ERROR") {
              console.error("[WhatsApp Embedded Signup ERROR Payload]", JSON.stringify(data, null, 2));
              setError(
                typeof data.error === "object"
                  ? data.error?.error_message || JSON.stringify(data.error)
                  : data.error || "An error occurred during WhatsApp setup."
              );
              setLoading(false);
            }
          }
        } catch (err) {
          // Ignore non-JSON messages
        }
      };

      if (messageListenerRef.current) {
        window.removeEventListener("message", messageListenerRef.current);
      }
      messageListenerRef.current = messageHandler;
      window.addEventListener("message", messageHandler);

      // Meta Facebook Login for Business - Embedded Signup v4 configuration
      const loginOptions = {
        config_id: EMBEDDED_SIGNUP_CONFIG_ID,
        response_type: "code",
        override_default_response_type: true,
        scope: "whatsapp_business_management,whatsapp_business_messaging",
        extras: {
          featureType: "whatsapp_business_app_onboarding",
          sessionInfoVersion: "3",
          setup: {},
        },
      };

      try {
        window.FB.login((response) => {
          console.log("[WhatsApp Embedded Signup] FB.login response:", response);
          if (response && response.authResponse && (response.authResponse.code || response.authResponse.accessToken)) {
            authCodeRef.current = response.authResponse.code || response.authResponse.accessToken;

            // If sessionInfo is already set via postMessage, trigger submit immediately
            if (sessionInfoRef.current) {
              trySubmitPayload();
            } else {
              // Wait up to 1500ms for postMessage to arrive if it's slightly delayed in task queue
              timeoutIdRef.current = setTimeout(() => {
                console.log("[WhatsApp Embedded Signup] Session info timeout reached, submitting available data.");
                trySubmitPayload();
              }, 1500);
            }
          } else {
            console.warn("[WhatsApp Embedded Signup] Cancelled or no authResponse code in response:", response);
            setCancelled(true);
            setLoading(false);
          }
        }, loginOptions);
      } catch (err) {
        console.error("[WhatsApp Embedded Signup] Error calling FB.login:", err);
        setError(`Failed to open Facebook Login window (${err?.message || "Popup blocked"}). Please allow popups.`);
        setLoading(false);
      }
    },
    []
  );

  return {
    isSdkLoaded,
    loading,
    error,
    cancelled,
    launchEmbeddedSignup,
  };
};

export default useWhatsappEmbeddedSignup;
