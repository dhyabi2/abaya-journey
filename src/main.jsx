import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      console.log("Service Worker registered successfully:", registration);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
};

const renderApp = async () => {
  const { default: App } = await import("./App.jsx");
  
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  registerServiceWorker();
};

renderApp().catch(console.error);
