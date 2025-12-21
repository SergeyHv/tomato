import React from "react";
import Header from "./Header";
import ProductGrid from "./ProductGrid";

export default function App({ products = [] }) {
  // Всегда массив: приводим вход к массиву
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="pt-[90px]">
      <Header onSearch={() => {}} cartCount={0} />
      <ProductGrid products={safeProducts} />
    </div>
  );
}
