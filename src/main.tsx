import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ViewModeProvider } from "../contexts/ViewModeContext";
import { ThemeProvider } from "../contexts/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ViewModeProvider>
          <App />
        </ViewModeProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
