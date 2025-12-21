import React from "react";

export default function ProductCard({ product = {} }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 hover:shadow-lg transition">
      <img
        src={product?.image || ""}
        alt={product?.name || "Без названия"}
        className="w-full h-40 object-cover rounded-lg"
      />

      <h3 className="text-lg font-semibold">{product?.name || "Нет имени"}</h3>

      <p className="text-gray-600 text-sm">{product?.type || "Не указан тип"}</p>

      <div className="text-red-600 font-bold text-xl">
        {product?.price ?? "—"} ₽
      </div>

      <button className="mt-auto bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
        Подробнее
      </button>
    </div>
  );
}
