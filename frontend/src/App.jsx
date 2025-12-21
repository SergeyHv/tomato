import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import ProductGrid from "./components/ProductGrid.jsx";

export default function App() {
  const [products, setProducts] = useState([]);

  // 🔎 Проверка: выводим значение переменной окружения в консоль
  console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      console.error("❌ VITE_API_URL не задан. Проверь настройки переменных окружения в Vercel.");
      return;
    }

    fetch(`${apiUrl}/api/products`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Ошибка запроса: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const safeProducts = Array.isArray(data)
          ? data.map((p) => ({
              id: p.id || "",
              name: p.title || "",
              type: p.category || "",
              color: p.props?.color || "",
              price: Number(p.price) || 0,
              image: p.images || "",
              description: p.description || "",
              stock: p.stock || 0,
              tags: p.tags || "",
            }))
          : [];
        setProducts(safeProducts);
      })
      .catch((err) => console.error("Ошибка загрузки:", err));
  }, []);

  return (
    <div className="pt-[90px] bg-gray-50 min-h-screen">
      <Header onSearch={() => {}} cartCount={0} />
      <ProductGrid products={products} />
    </div>
  );
}
