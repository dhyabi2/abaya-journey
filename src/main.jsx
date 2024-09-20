import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Function to register service worker
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

// Register service worker after rendering the app
registerServiceWorker();
