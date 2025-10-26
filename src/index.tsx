/* istanbul ignore file */
import "~/styles/index.scss";
import { StrictMode } from "react";
import reactDOMClient from "react-dom/client";
import { App } from "~/components/App";
import React from "react";
import { HashRouter } from "react-router-dom";

const rootContainer = document.createElement("div");
document.body.appendChild(rootContainer);
const root = reactDOMClient.createRoot(rootContainer);
root.render(
    <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
 