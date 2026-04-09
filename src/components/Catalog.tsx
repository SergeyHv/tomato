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

const DEFAULT_PAGE_SIZE = 24;

interface CatalogProps {
  tomatoes: Tomato[];
  cartItems: CartItem[];
  onAddToCart: (tomato: Tomato) => void;
  onViewDetail: (tomato: Tomato) => void;
}

/** ИСПРАВЛЕНО: теперь используем id */
const TomatoImage: React.FC<{ id: string; alt: string }> = ({ id, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const src = `/images/${id}.jpg`;

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
    return tomatoes.filter((tomato) => {
      const matchesSearch =
        tomato.name.toLowerCase().includes(filters.search.toLowerCase());

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

  if (total === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
        <p className="text-stone-400 text-lg">Ничего не найдено.</p>
        <p className="text-stone-300 text-sm mt-2">
          Попробуйте изменить фильтры.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div ref={topAnchorRef} className="sr-only" aria-hidden />

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-stone-400" />
        </div>

        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-stone-200 rounded-lg bg-white"
          placeholder="Поиск по названию..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
        />

        {filters.search && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setFilters({ ...filters, search: '' })}
          >
            <X className="h-4 w-4 text-stone-400" />
          </button>
        )}
      </div>

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
                <TomatoImage id={tomato.id} alt={tomato.name} />
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
                    className="w-full py-2 rounded-lg bg-stone-800 text-white"
                  >
                    {isInCart ? 'Добавлено' : 'В список'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button onClick={() => goPage(page - 1)}>
            <ChevronLeft />
          </button>

          <span>
            {page} / {totalPages}
          </span>

          <button onClick={() => goPage(page + 1)}>
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};
