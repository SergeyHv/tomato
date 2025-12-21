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
    <>
      {/* Кнопка открытия */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 mt-6 mb-6">
        <button
          onClick={() => setOpen(true)}
          className="px-5 py-2.5 bg-white border border-rose-200 rounded-full shadow-sm text-rose-700 hover:border-rose-400 transition-all"
        >
          Фильтры
        </button>
      </div>

      {/* Overlay (закрывает по клику вне панели) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Боковая панель */}
      <aside
        className={`fixed top-[90px] left-0 z-50 h-[calc(100vh-90px)] w-[300px] bg-white border-r border-rose-100 shadow-lg transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Шапка панели (всегда видима) */}
        <div className="sticky top-0 z-10 bg-white border-b border-rose-100 p-4 flex items-center justify-between">
          <div className="text-xs font-semibold text-rose-700 tracking-[0.1em] uppercase">
            Фильтры
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-rose-500 hover:text-rose-700 text-sm font-bold uppercase tracking-[0.2em]"
          >
            ✕ Закрыть
          </button>
        </div>

        {/* Прокручиваемая область контента */}
        <div className="h-[calc(100%-57px)] overflow-y-auto p-6">
          <FiltersPanel
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            sort={sort}
            setSort={setSort}
          />
        </div>
      </aside>
    </>
  );
}
