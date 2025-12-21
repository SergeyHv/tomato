import React from "react";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  // products = [] по умолчанию → защита от undefined

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        Ничего не найдено
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
