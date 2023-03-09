import React from "react";
import ReactDOM from "react-dom/client";
import App from "./_app";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

navigator.serviceWorker.getRegistrations().then((registrations) => {
  for (let registration of registrations) {
    registration.unregister();
  }
});
