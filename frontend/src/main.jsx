import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Находим корневой элемент
const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

// Рендерим приложение напрямую
root.render(
  <App products={window.__PRODUCTS__ || []} />
);
