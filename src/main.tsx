import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BudgetProvider } from "./store";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BudgetProvider>
      <App />
    </BudgetProvider>
  </StrictMode>,
);
