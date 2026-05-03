import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tomato, CartItem, FilterState } from '../types';
import {
  Search,
  X,
  Loader2,
  ImageOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { localize } from '../utils/localization';
import { Filters } from './Filters';

const DEFAULT_PAGE_SIZE = 24;

interface CatalogProps {
  tomatoes: Tomato[];
  cartItems: CartItem[];
  onAddToCart: (tomato: Tomato) => void;
  onViewDetail: (tomato: Tomato) => void;
}

const TomatoImage: React.FC<{ tomato: Tomato }> = ({ tomato }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const src = tomato.imageUrl || `/images/${tomato.id}.jpg`;

  return (
    <>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-300">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}

      {!hasError && (
        <img
          src={src}
          alt={tomato.name}
          className={`w-full h-full object-cover object-left transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 bg-stone-100">
          <ImageOff size={32} />
          <span className="text-xs font-medium mt-1">Нет фото</span>
        </div>
      )}
    </>
  );
};

export const Catalog: React.FC<CatalogProps> = ({
  tomatoes,
  cartItems,
  onAddToCart,
  onViewDetail,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    environment: '',
    ripening: '',
    color: '',
    type: '',
    growth: '',
  });

  const topAnchorRef = useRef<HTMLDivElement>(null);

  const filteredTomatoes = useMemo(() => {
    if (!tomatoes || tomatoes.length === 0) return [];
    return tomatoes.filter((tomato) => {
      const matchesSearch =
        tomato.name?.toLowerCase().includes(filters.search.toLowerCase()) || false;

      const matchesColor = !filters.color || tomato.color === filters.color;
      const matchesType = !filters.type || tomato.type === filters.type;
      const matchesGrowth = !filters.growth || tomato.growth === filters.growth;
      const matchesRipening =
        !filters.ripening || tomato.ripening === filters.ripening;

      return (
        matchesSearch &&
        matchesColor &&
        matchesType &&
        matchesGrowth &&
        matchesRipening
      );
    });
  }, [tomatoes, filters]);

  const total = filteredTomatoes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filteredTomatoes]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const visible = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTomatoes.slice(start, start + pageSize);
  }, [filteredTomatoes, page, pageSize]);

  const goPage = (next: number) => {
    const clamped = Math.min(totalPages, Math.max(1, next));
    setPage(clamped);
    topAnchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      environment: '',
      ripening: '',
      color: '',
      type: '',
      growth: '',
    });
  };

  if (!tomatoes || tomatoes.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
        <p className="text-stone-400 text-lg">Загрузка томатов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div ref={topAnchorRef} className="sr-only" aria-hidden />

      {/* БЛОК ФИЛЬТРОВ */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-stone-700">🔍 Фильтры и поиск</h3>
          {(filters.search || filters.environment || filters.ripening || filters.color || filters.type || filters.growth) && (
            <button
              onClick={resetFilters}
              className="text-sm text-rose-500 hover:text-rose-700 flex items-center gap-1"
            >
              <X size={14} /> Сбросить всё
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Поиск по названию..."
              className="w-full border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
          </div>

          {/* Цвет */}
          <select
            value={filters.color}
            onChange={(e) => setFilters({ ...filters, color: e.target.value })}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">🎨 Все цвета</option>
            <option value="Red">Красный</option>
            <option value="Pink">Розовый</option>
            <option value="Yellow">Жёлтый</option>
            <option value="Orange">Оранжевый</option>
            <option value="Black">Чёрный/Тёмный</option>
            <option value="Green">Зелёный</option>
            <option value="BiColor">Биколор</option>
          </select>

          {/* Тип плода */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">🍅 Все типы</option>
            <option value="Cherry">Черри</option>
            <option value="Plum">Сливовидный</option>
            <option value="Classic">Классический</option>
            <option value="Beefsteak">Бифштексный</option>
            <option value="Heart">Сердцевидный</option>
          </select>

          {/* Тип куста */}
          <select
            value={filters.growth}
            onChange={(e) => setFilters({ ...filters, growth: e.target.value })}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">🌱 Все кусты</option>
            <option value="Гном">Гном</option>
            <option value="Дет">Низкорослый (Дет)</option>
            <option value="Среднерослый">Среднерослый</option>
            <option value="Индет">Высокорослый (Индет)</option>
          </select>

          {/* Срок созревания */}
          <select
            value={filters.ripening}
            onChange={(e) => setFilters({ ...filters, ripening: e.target.value })}
            className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">📅 Все сроки</option>
            <option value="Ранний">Ранний</option>
            <option value="Средний">Средний</option>
            <option value="Поздний">Поздний</option>
          </select>

          {/* Счётчик */}
          <div className="flex items-center justify-center bg-stone-50 rounded-lg px-3 py-2 text-sm">
            <span className="text-stone-600">
              Найдено: <span className="font-bold text-emerald-600">{total}</span> из {tomatoes.length}
            </span>
          </div>
        </div>
      </div>

      {/* СЕТКА ТОМАТОВ */}
      {total === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
          <p className="text-stone-400 text-lg">Ничего не найдено.</p>
          <p className="text-stone-300 text-sm mt-2">Попробуйте изменить фильтры.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {visible.map((tomato) => {
              const isInCart = cartItems.some(
                (item) => item.tomato.id === tomato.id
              );

              return (
                <div
                  key={tomato.id}
                  className="group bg-white rounded-2xl border shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  <div
                    className="relative h-56 bg-stone-100 cursor-pointer overflow-hidden"
                    onClick={() => onViewDetail(tomato)}
                  >
                    <TomatoImage tomato={tomato} />
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h3
                      className="font-bold text-lg cursor-pointer"
                      onClick={() => onViewDetail(tomato)}
                    >
                      {tomato.name}
                    </h3>

                    <div className="text-xs text-stone-500 mt-2">
                      {localize(tomato.color)} • {localize(tomato.type)}
                    </div>

                    <div className="mt-auto pt-4">
                      <button
                        onClick={() => onAddToCart(tomato)}
                        disabled={isInCart}
                        className="w-full py-2 rounded-lg bg-stone-800 text-white disabled:bg-stone-300 disabled:cursor-not-allowed"
                      >
                        {isInCart ? 'Добавлено' : 'В список'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ПАГИНАЦИЯ */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-lg border disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => goPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded-lg border disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
