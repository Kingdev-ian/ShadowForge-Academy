import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// Tailwind directives + the obsidian/limestone CSS variable palette.
// Without this import the utility classes never compile and the app renders
// unstyled — which is the failure mode that used to force everyone back to
// the CDN document.
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("ShadowForge boot error: #root is missing from the document.");
}

createRoot(container).render(<App />);

// ---------------------------------------------------------------------------
// DEV CONSOLE DIAGNOSTIC
// src/ reads its synth body from <script id="citadel-audio-src"> so the Vite
// app and the legacy CDN document can never drift apart. If that element is
// missing, forge-audio.js silently falls back to its own embedded copy — which
// works, but means you are no longer testing the shared source. This makes
// that situation loud instead of invisible.
// ---------------------------------------------------------------------------
if (import.meta.env && import.meta.env.DEV) {
  window.setTimeout(() => {
    const shared = document.getElementById("citadel-audio-src");
    const ok = !!(shared && shared.textContent && shared.textContent.trim().length > 40);
    if (!ok) {
      console.warn(
        "[ShadowForge] #citadel-audio-src not found in the document — forge-audio.js " +
          "is running on its embedded FALLBACK_SRC copy, not the shared synth body."
      );
    }
  }, 0);
}

