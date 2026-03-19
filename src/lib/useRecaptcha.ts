"use client";

import { useCallback, useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Hook to load Google reCAPTCHA v3 and execute it on demand.
 * Returns an `executeRecaptcha(action)` function that resolves to a token.
 * If the site key is not configured, it returns an empty string (graceful skip).
 */
export function useRecaptcha() {
  const loaded = useRef(false);

  useEffect(() => {
    if (!SITE_KEY || loaded.current) return;
    if (document.querySelector(`script[src*="recaptcha"]`)) {
      loaded.current = true;
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    loaded.current = true;
  }, []);

  const executeRecaptcha = useCallback(
    (action: string): Promise<string> => {
      if (!SITE_KEY) return Promise.resolve("");
      return new Promise((resolve) => {
        if (!window.grecaptcha) {
          resolve("");
          return;
        }
        window.grecaptcha.ready(() => {
          window.grecaptcha!.execute(SITE_KEY, { action }).then(resolve).catch(() => resolve(""));
        });
      });
    },
    []
  );

  return { executeRecaptcha, siteKey: SITE_KEY };
}
