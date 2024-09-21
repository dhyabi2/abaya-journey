import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

registerServiceWorker().catch(console.error);
