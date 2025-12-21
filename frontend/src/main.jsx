import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

// Проверяем, что приходит из таблицы
console.log("PRODUCTS:", window.__PRODUCTS__);

// Жёстко нормализуем данные
const safeProducts = Array.isArray(window.__PRODUCTS__)
  ? window.__PRODUCTS__.map(p => ({
      id: p?.id || "",
      name: p?.name || "",
      type: p?.type || "",
      color: p?.color || "",
      price: Number(p?.price) || 0,
      image: p?.image || ""
    }))
  : [];

root.render(<App products={safeProducts} />);

