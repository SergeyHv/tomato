import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tomato, CartItem, FilterState } from '../types';
import { Search, X, Filter, Loader2, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { localize } from '../utils/localization';

const DEFAULT_PAGE_SIZE = 24;
const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;

interface CatalogProps {
  tomatoes: Tomato[];
  cartItems: CartItem[];
  onAddToCart: (tomato: Tomato) => void;
  onViewDetail: (tomato: Tomato) => void;
}

const TomatoImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-5 ${
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
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
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
    return tomatoes.filter(tomato => {
      const matchesSearch = 
        tomato.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (tomato.originalName && tomato.originalName.toLowerCase().includes(filters.search.toLowerCase()));      
      const matchesColor = !filters.color || tomato.color === filters.color;
      const matchesType = !filters.type || tomato.type === filters.type;
      const matchesGrowth = !filters.growth || tomato.growth === filters.growth;
      const matchesRipening = !filters.ripening || tomato.ripening === filters.ripening;
      
      return matchesSearch && matchesColor && matchesType && matchesGrowth && matchesRipening;
    });
  }, [tomatoes, filters]);

  const total = filteredTomatoes.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filteredTomatoes]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages  const visible = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTomatoes.slice(start, start + pageSize);
  }, [filteredTomatoes, page, pageSize]);

  const goPage = (next: number) => {
    const clamped = Math.min(totalPages, Math.max(1, next));
    setPage(clamped);
    topAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Номера страниц для полосы навигации (с сжатием через … при большом totalPages). */
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set<number>([1, totalPages, page]);
    for (let d = -1; d <= 1; d++) {
      const p = page + d;
      if (p >= 1 && p <= totalPages) pages.add(p);
    }
    return [...pages].sort((a, b) => a - b).reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
      acc.push(p);
      return acc;
    }, []);
  }, [page, totalPages]);

  if (total === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
        <p className="text-stone-400 text-lg">Ничего не найдено.</p>
        <p className="text-stone-300 text-sm mt-2">Попробуйте изменить фильтры.</p>
      </div>
    );
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      <div ref={topAnchorRef} className="sr-only" aria-hidden />
      
      {/* Строка поиска */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-stone-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          name="search"
          id="search"
          className="block w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg leading-5 bg-white placeholder-stone-500 focus:outline-none focus:placeholder-stone-400 focus:ring-1 focus:ring-tomato-500 focus:border-tomato-500 sm:text-sm"
          placeholder="Поиск по названию..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
        {filters.search && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setFilters({...filters, search: ''})}
          >
            <X className="h-4 w-4 text-stone-400" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-stone-600">
        <p>
          Показано{' '}
          <span className="font-semibold text-stone-800">
            {from}–{to}
          </span>{' '}
          из <span className="font-semibold text-stone-800">{total}</span>
        </p>
        <label className="flex items-center gap-2">
          <span className="text-stone-500">На странице</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="border border-stone-200 rounded-lg px-2 py-1.5 bg-white text-stone-800 cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {visible.map((tomato) => {
        const isInCart = cartItems.some(
          (item) => item.tomato.id === tomato.id
        );

        let badgeColor = 'bg-stone-100 text-stone-800';
        if (tomato.color === 'Red') badgeColor = 'bg-red-100 text-red-800';
        if (tomato.color === 'Green') badgeColor = 'bg-green-100 text-green-800';
        if (tomato.color === 'Yellow')
          badgeColor = 'bg-yellow-100 text-yellow-800';
        if (tomato.color === 'Orange')
          badgeColor = 'bg-orange-100 text-orange-800';
        if (tomato.color.includes('Black'))
          badgeColor = 'bg-slate-800 text-white';

        return (
          <div
            key={tomato.id}
            className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div
              className="relative h-48 md:h-64 overflow-hidden bg-stone-100 cursor-pointer"
              onClick={() => onViewDetail(tomato)}
            >
              {tomato.imageUrl ? (
                <TomatoImage src={tomato.imageUrl} alt={tomato.name} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 bg-stone-100">
                  <ImageOff size={32} />
                  <span className="text-xs font-medium mt-1">Нет фото</span>
                </div>
              )}

              {isInCart && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 z-10">
                  <Check size={12} /> В списке
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end z-10">
                <button className="text-white text-xs flex items-center gap-1 hover:underline">
                  <Info size={14} /> Подробнее
                </button>
              </div>
            </div>

            <div className="p-4 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3
                    className="font-bold text-stone-800 text-lg leading-tight group-hover:text-tomato-600 transition-colors cursor-pointer"
                    onClick={() => onViewDetail(tomato)}
                  >
                    {tomato.name}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${badgeColor}`}
                    >
                      {localize(tomato.color)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                      {localize(tomato.type)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => onAddToCart(tomato)}
                  disabled={isInCart}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                    isInCart
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                      : 'bg-stone-800 text-white hover:bg-tomato-600 active:bg-tomato-700'
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check size={16} /> Добавлено
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> В список
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {totalPages > 1 && (
        <nav
          className="flex flex-col items-center justify-center gap-3 pt-2"
          aria-label="Страницы каталога"
        >
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            {pageNumbers.map((item, i) =>
              item === 'ellipsis' ? (
                <span
                  key={`e-${i}`}
                  className="px-1 text-stone-400 select-none"
                  aria-hidden
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => goPage(item)}
                  aria-current={item === page ? 'page' : undefined}
                  className={`min-w-[2.25rem] h-9 rounded-lg text-sm font-medium tabular-nums transition-colors ${
                    item === page
                      ? 'bg-stone-800 text-white shadow-sm'
                      : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft size={18} /> Назад
            </button>
            <span className="text-sm text-stone-600 tabular-nums px-2">
              Страница {page} из {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goPage(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none"
            >
              Вперёд <ChevronRight size={18} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
