import React from "react";
import ReactDOM from "react-dom/client";
import ContentApp from "./ContentApp";

const CONTAINER_ID = "formease-root";

function init() {
  try {
    if (document.getElementById(CONTAINER_ID)) return;

    const container = document.createElement("div");
    container.id = CONTAINER_ID;

    const shadowRoot = container.attachShadow({ mode: "open" });

    const styleEl = document.createElement("style");
    styleEl.textContent = `/* Tailwind styles will be injected here during build */`;
    shadowRoot.appendChild(styleEl);

    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = chrome.runtime.getURL("assets/content.css");
    shadowRoot.appendChild(linkEl);

    const appRoot = document.createElement("div");
    appRoot.id = "app";
    shadowRoot.appendChild(appRoot);

    document.body.appendChild(container);

    ReactDOM.createRoot(appRoot).render(
      <React.StrictMode>
        <ContentApp />
      </React.StrictMode>,
    );

    console.debug("[FormEase] Content script mounted successfully");
  } catch (error) {
    console.error("[FormEase] Failed to initialize content script:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
