import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary"; // подключаем наш новый файл

// Находим корневой элемент
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// Рендерим приложение внутри ErrorBoundary
root.render(
  <ErrorBoundary>
    <App products={window.__PRODUCTS__ || []} />
  </ErrorBoundary>
);

