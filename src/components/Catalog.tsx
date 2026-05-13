import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Tomato, CartItem, FilterState } from '../types';
import {
  Search,
  X,
  Loader2,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Menu,
  ChevronsRight,
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
    isNew: undefined,
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState('');
  const topAnchorRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const filteredTomatoes = useMemo(() => {
    if (!tomatoes || tomatoes.length === 0) return [];

    return tomatoes.filter((tomato) => {
      if (tomato.isAvailable === false) return false;

      const matchesSearch =
        tomato.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (tomato.ocrText && tomato.ocrText.toLowerCase().includes(filters.search.toLowerCase())) ||
        false;

      const matchesColor = !filters.color || tomato.color === filters.color;
      const matchesType = !filters.type || tomato.type === filters.type;

      const getGrowthCategory = (growth: string) => {
        if (growth === 'Гном' || growth === 'Дет') return 'low';
        if (growth === 'Среднерослый') return 'medium';
        if (growth === 'Индет') return 'high';
        return '';
      };
      const matchesGrowth = !filters.growth || getGrowthCategory(tomato.growth) === filters.growth;

      const matchesRipening = !filters.ripening || tomato.ripening === filters.ripening;

      let matchesEnvironment = true;
      if (filters.environment === 'ground' && !filters.growth) {
        matchesEnvironment =
          tomato.ripening !== 'Позднеспелый' && tomato.growth !== 'Индет';
      }

      const matchesNew = filters.isNew ? tomato.isNew === true : true;

      return (
        matchesSearch &&
        matchesColor &&
        matchesType &&
        matchesGrowth &&
        matchesRipening &&
        matchesEnvironment &&
        matchesNew
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
    setJumpInput('');
    topAnchorRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target)) goPage(target);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      environment: '',
      ripening: '',
      color: '',
      type: '',
      growth: '',
      isNew: undefined,
    });
  };

  const toggleFilters = () => {
    const newState = !isFiltersOpen;
    setIsFiltersOpen(newState);
    if (newState) {
      setTimeout(() => {
        filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
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

      <div className="sticky top-16 z-20 bg-stone-50 pt-2 pb-2 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFilters}
            className="p-2 bg-white rounded-full shadow border border-stone-200"
            aria-label="Фильтры"
          >
            <Menu size={20} />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="🔎 Поиск по названию, описанию, тексту на фото..."
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
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8">
        <aside
          ref={filtersRef}
          className={`w-full lg:w-80 xl:w-96 ${isFiltersOpen ? 'block' : 'hidden lg:block'}`}
        >
          <div className="lg:sticky lg:top-4">
            <Filters
              filters={filters}
              onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
              onReset={resetFilters}
              totalCount={tomatoes.length}
              filteredCount={total}
            />
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="hidden lg:block relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="🔎 Поиск по названию, описанию, тексту на фото..."
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

          <div className="text-left text-sm text-stone-500 mb-4">
            Найдено сортов: <span className="font-bold text-emerald-600">{total}</span>
          </div>

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
                        {tomato.isNew && (
                          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                            Новинка 2026
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <h3
                          className="font-bold text-lg cursor-pointer"
                          onClick={() => onViewDetail(tomato)}
                        >
                          {tomato.name}
                        </h3>
                        {tomato.isNew && (
                          <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded mt-1">
                            🌱 Новинка 2026
                          </span>
                        )}
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

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                  <button
                    onClick={() => goPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg border disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <span className="text-sm">{page} / {totalPages}</span>

                  <button
                    onClick={() => goPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 ml-2">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={jumpInput}
                      onChange={(e) => setJumpInput(e.target.value)}
                      placeholder="№"
                      className="w-14 text-center border border-stone-200 rounded-lg px-1 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-lg border hover:bg-stone-50"
                      title="Перейти на страницу"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
