import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { fetchProducts } from "./services/apiClient.js";
import { ProductListSchema } from "./domain/productSchema.js";
import { mapRawToProduct } from "./domain/mapProduct.js";

const BUILD_VERSION = import.meta.env?.VITE_BUILD_VERSION ?? "dev";

export default function App() {
  const [products, setProducts] = useState([]);
  const [state, setState] = useState({ loading: true, error: null, query: "" });

  const filtered = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const hay = `${p.name} ${p.type ?? ""} ${p.color ?? ""} ${Array.isArray(p.tags) ? p.tags.join(" ") : p.tags ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, state.query]);

  useEffect(() => {
    console.log("Boot: version =", BUILD_VERSION);
    console.log("Env: VITE_API_URL =", import.meta.env.VITE_API_URL);

    (async () => {
      try {
        const raw = await fetchProducts();
        const mapped = raw.filter(Boolean).map(mapRawToProduct);

        const parsed = ProductListSchema.safeParse(mapped);
        if (!parsed.success) {
          console.error("Schema validation failed:", parsed.error.flatten());
          throw new Error("Данные не соответствуют схеме продукта");
        }

        setProducts(parsed.data);
        setState((s) => ({ ...s, loading: false, error: null }));
      } catch (err) {
        console.error("Load products failed:", err);
        setState((s) => ({ ...s, loading: false, error: err.message || String(err) }));
      }
    })();
  }, []);

  const onSearch = (q) => setState((s) => ({ ...s, query: q }));

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onSearch={onSearch} cartCount={0} />
        <div className="container-xl py-12 text-gray-600">Загружаем товары…</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="pt-[90px] bg-gray-50 min-h-screen">
        <Header onSearch={onSearch} cartCount={0} />
        {state.error ? (
          <div className="container-xl py-12 text-red-600">
            Ошибка загрузки: {state.error}
          </div>
        ) : (
          <ProductGrid products={filtered} />
        )}
        <footer className="container-xl pb-12 text-xs text-gray-400">
          Версия сборки: {BUILD_VERSION}
        </footer>
      </div>
    </ErrorBoundary>
  );
}
