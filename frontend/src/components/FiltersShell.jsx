import React, { useState } from "react";
import FiltersPanel from "./FiltersPanel";

export default function FiltersShell({
  selectedColor,
  setSelectedColor,
  selectedType,
  setSelectedType,
  sort,
  setSort
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 mt-6 mb-6">
      
      {/* Кнопка открытия */}
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 bg-white border border-rose-200 rounded-full shadow-sm text-rose-700 hover:border-rose-400 transition-all"
      >
        Фильтры
      </button>

      {/* Боковая панель */}
      {open && (
        <div className="fixed top-[90px] left-0 h-[calc(100vh-90px)] w-[280px] bg-white border-r border-rose-100 shadow-lg z-40 p-6 overflow-y-auto">
          
          {/* Кнопка закрытия */}
          <button
            onClick={() => setOpen(false)}
            className="mb-4 text-rose-500 hover:text-rose-700 text-sm font-bold uppercase tracking-[0.2em]"
          >
            ✕ Закрыть
          </button>

          <FiltersPanel
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            sort={sort}
            setSort={setSort}
          />
        </div>
      )}

      {/* Сдвиг контента вправо, если панель открыта */}
      <div className={open ? "ml-[300px]" : ""}>
        {/* Здесь будет ProductGrid */}
      </div>
    </div>
  );
}
