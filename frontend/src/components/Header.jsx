import React from "react";

export default function Header({ onSearch, cartCount = 0 }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-rose-50/95 backdrop-blur-sm shadow-sm border-b border-rose-100">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-9 w-9 rounded-full bg-rose-200 border border-rose-300 flex items-center justify-center text-rose-700 font-serif text-lg">
            Т
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-lg md:text-xl font-semibold text-rose-900 tracking-[0.08em] uppercase">
              Томатный Рай
            </span>
            <span className="text-[11px] md:text-xs text-rose-500">
              Коллекционные семена для вдохновляющего сада
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-rose-700 ml-4">
          <a href="/catalog" className="hover:text-rose-500 transition-colors">Каталог</a>
          <a href="/about" className="hover:text-rose-500 transition-colors">О нас</a>
          <a href="/tips" className="hover:text-rose-500 transition-colors">Советы</a>
        </nav>

        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-xs md:max-w-md">
            <input
              type="text"
              placeholder="Найти любимый сорт..."
              className="w-full px-4 py-2.5 rounded-full border border-rose-200 bg-white/80 text-sm text-rose-900 placeholder:text-rose-300 shadow-[0_0_0_1px_rgba(248,226,231,0.6)] focus:outline-none focus:border-rose-400 focus:shadow-[0_0_0_2px_rgba(244,143,177,0.35)] transition-all"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-rose-200 text-rose-600 hover:text-rose-700 hover:border-rose-400 shadow-sm transition-all"
            aria-label="Корзина"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M5 5h2l1 10h10l1-8H8" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] px-1.5 h-[18px] rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
