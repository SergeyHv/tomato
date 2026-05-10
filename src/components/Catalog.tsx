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
import { Filters } from './Filters';  // ← новый человеколюбивый компонент

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
          className={`w-full h-full object-cover object-left transition-all duration-300 group-hover:scale-105 ${
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

  // Основная фильтрация с поддержкой environment (грядка/теплица)
  const filteredTomatoes = useMemo(() => {
    if (!tomatoes || tomatoes.length === 0) return [];

    return tomatoes.filter((tomato) => {
      // Поиск по имени
      const matchesSearch =
        tomato.name?.toLowerCase().includes(filters.search.toLowerCase()) || false;

      // Цвет
      const matchesColor = !filters.color || tomato.color === filters.color;
      // Тип плода
      const matchesType = !filters.type || tomato.type === filters.type;
      // Тип куста (рост)
      const matchesGrowth = !filters.growth || tomato.growth === filters.growth;
      // Срок созревания
      const matchesRipening =
        !filters.ripening || tomato.ripening === filters.ripening;

      // Логика для "Для грядок" и "Для теплиц"
      let matchesEnvironment = true;
      if (filters.environment === 'ground') {
        // Для грядок исключаем позднеспелые и высокорослые (Индет)
        matchesEnvironment =
          tomato.ripening !== 'Позднеспелый' && tomato.growth !== 'Индет';
      } else if (filters.environment === 'greenhouse') {
        // Для теплиц никаких ограничений (можно оставить true)
        matchesEnvironment = true;
      }

      return (
        matchesSearch &&
        matchesColor &&
        matchesType &&
        matchesGrowth &&
        matchesRipening &&
        matchesEnvironment
      );
    });
  }, [tomatoes, filters]);

  const total = filteredTomatoes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [filteredTomatoes]);

  // Корректировка страницы, если она стала больше общего количества
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

  // Есть ли активные фильтры (для отображения кнопки сброса)
  const hasActiveFilters = !!(
    filters.search ||
    filters.environment ||
    filters.ripening ||
    filters.color ||
    filters.type ||
    filters.growth
  );

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

      {/* НОВЫЙ ЧЕЛОВЕКОЛЮБИВЫЙ ФИЛЬТР */}
      <Filters
        filters={filters}
        onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
        onReset={resetFilters}
        totalCount={tomatoes.length}
        filteredCount={total}
      />

      {/* ПОИСК (строка) – можно оставить или перенести в Filters, но для удобства оставим здесь */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="🔎 Поиск по названию..."
          className="w-full border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm bg-white"
        />
        {filters.search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            onClick={() => setFilters({ ...filters, search: '' })}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Счётчик над карточками */}
      <div className="text-right text-sm text-stone-500">
        Найдено сортов: <span className="font-bold text-emerald-600">{total}</span>
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

export default Catalog;
