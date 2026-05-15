import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  ChevronsLeft,
  RotateCcw,
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

const FILTER_LABELS: Record<string, string> = {
  isNew: 'Новинки 2026',
  'Cherry': 'Черри',
  'Pepper': 'Перцы',
  'ground': 'Для открытого грунта',
  'low': 'Низкорослые',
  'medium': 'Среднерослые',
  'high': 'Индетерминантные',
  'Красный': 'Красный',
  'Жёлтый': 'Жёлтый',
  'Оранжевый': 'Оранжевый',
  'Тёмный': 'Тёмный',
  'Зелёный': 'Зелёный',
  'Биколор': 'Биколор',
  'Раннеспелый': 'Раннеспелые',
  'Среднеспелый': 'Среднеспелые',
  'Позднеспелый': 'Позднеспелые',
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchMoved = useRef(false);

  const handleSheetTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleSheetTouchMove = (e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY;
  };
  const handleSheetTouchEnd = () => {
    const diff = touchEndY.current - touchStartY.current;
    if (diff > 60) {
      setIsFiltersOpen(false);
    }
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  const handleCardsTouchStart = (e: React.TouchEvent) => {
    if (isFiltersOpen) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchMoved.current = false;
  };

  const handleCardsTouchMove = (e: React.TouchEvent) => {
    if (isFiltersOpen || !touchStartX.current) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
      touchMoved.current = true;
    }
  };

  const handleCardsTouchEnd = (e: React.TouchEvent) => {
    if (isFiltersOpen || !touchStartX.current || !touchMoved.current) {
      touchStartX.current = 0;
      touchMoved.current = false;
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = 0;
    touchMoved.current = false;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 80) {
      if (deltaX < -50 && page < totalPages) {
        goPage(page + 1);
      } else if (deltaX > 50 && page > 1) {
        goPage(page - 1);
      }
    }
  };

  const baseFiltered = useMemo(() => {
    if (!tomatoes || tomatoes.length === 0) return [];
    return tomatoes.filter(t => {
      if (t.isAvailable === false) return false;

      const matchesSearch =
        !filters.search ||
        t.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.ocrText && t.ocrText.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesColor = !filters.color || t.color === filters.color;
      const matchesType = !filters.type || t.type === filters.type;

      const getGrowthCategory = (growth: string) => {
        if (growth === 'Гном' || growth === 'Дет') return 'low';
        if (growth === 'Среднерослый') return 'medium';
        if (growth === 'Индет') return 'high';
        return '';
      };
      const matchesGrowth = !filters.growth || getGrowthCategory(t.growth) === filters.growth;

      const matchesRipening = !filters.ripening || t.ripening === filters.ripening;

      let matchesEnvironment = true;
      if (filters.environment === 'ground' && !filters.growth) {
        matchesEnvironment =
          t.ripening !== 'Позднеспелый' && t.growth !== 'Индет';
      }

      const matchesNew = filters.isNew === undefined || filters.isNew === false || t.isNew === true;

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

  const filteredTomatoes = baseFiltered;
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
    setIsFiltersOpen(!isFiltersOpen);
  };

  const smartCounts = useMemo(() => {
    const counts: {
      colors: { value: string; count: number }[];
      types: { value: string; count: number }[];
      growths: { value: string; count: number }[];
      ripenings: { value: string; count: number }[];
      isNewCount: number;
    } = {
      colors: [],
      types: [],
      growths: [],
      ripenings: [],
      isNewCount: 0,
    };

    if (!tomatoes || tomatoes.length === 0) return counts;

    const matchesExcept = (t: Tomato, exceptField: keyof FilterState) => {
      if (t.isAvailable === false) return false;

      if (exceptField !== 'search' && filters.search) {
        const s = filters.search.toLowerCase();
        if (!t.name?.toLowerCase().includes(s) && !(t.ocrText && t.ocrText.toLowerCase().includes(s))) return false;
      }
      if (exceptField !== 'color' && filters.color && t.color !== filters.color) return false;
      if (exceptField !== 'type' && filters.type && t.type !== filters.type) return false;

      if (exceptField !== 'growth' && filters.growth) {
        const cat = (growth: string) => {
          if (growth === 'Гном' || growth === 'Дет') return 'low';
          if (growth === 'Среднерослый') return 'medium';
          if (growth === 'Индет') return 'high';
          return '';
        };
        if (cat(t.growth) !== filters.growth) return false;
      }

      if (exceptField !== 'ripening' && filters.ripening && t.ripening !== filters.ripening) return false;

      if (exceptField !== 'environment' && filters.environment === 'ground' && !filters.growth) {
        if (t.ripening === 'Позднеспелый' || t.growth === 'Индет') return false;
      }

      if (exceptField !== 'isNew' && filters.isNew !== undefined && filters.isNew === true && t.isNew !== true) return false;

      return true;
    };

    const colorValues = [...new Set(tomatoes.map(t => t.color))].sort();
    counts.colors = colorValues.map(val => ({
      value: val,
      count: tomatoes.filter(t => t.color === val && matchesExcept(t, 'color')).length,
    }));

    const typeValues = [...new Set(tomatoes.map(t => t.type))].sort();
    counts.types = typeValues.map(val => ({
      value: val,
      count: tomatoes.filter(t => t.type === val && matchesExcept(t, 'type')).length,
    }));

    const growthMap: { [key: string]: string } = {
      'low': 'Низкорослые (Гном, Дет)',
      'medium': 'Среднерослые',
      'high': 'Индетерминантные',
    };
    counts.growths = Object.keys(growthMap).map(key => ({
      value: key,
      count: tomatoes.filter(t => {
        const cat = (growth: string) => {
          if (growth === 'Гном' || growth === 'Дет') return 'low';
          if (growth === 'Среднерослый') return 'medium';
          if (growth === 'Индет') return 'high';
          return '';
        };
        return cat(t.growth) === key && matchesExcept(t, 'growth');
      }).length,
    }));

    const ripeningValues = [...new Set(tomatoes.map(t => t.ripening))].sort();
    counts.ripenings = ripeningValues.map(val => ({
      value: val,
      count: tomatoes.filter(t => t.ripening === val && matchesExcept(t, 'ripening')).length,
    }));

    counts.isNewCount = tomatoes.filter(t => t.isNew === true && matchesExcept(t, 'isNew')).length;

    return counts;
  }, [tomatoes, filters]);

  const activeFilterLabels: string[] = [];
  if (filters.isNew) activeFilterLabels.push(FILTER_LABELS['isNew']);
  if (filters.type) activeFilterLabels.push(FILTER_LABELS[filters.type] || filters.type);
  if (filters.environment) activeFilterLabels.push(FILTER_LABELS[filters.environment] || filters.environment);
  if (filters.ripening) activeFilterLabels.push(FILTER_LABELS[filters.ripening] || filters.ripening);
  if (filters.growth) activeFilterLabels.push(FILTER_LABELS[filters.growth] || filters.growth);
  if (filters.color) activeFilterLabels.push(FILTER_LABELS[filters.color] || filters.color);

  const createRipple = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    const existing = target.querySelector('.ripple-effect');
    if (existing) existing.remove();

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    ripple.style.left = `${clientX - rect.left - size / 2}px`;
    ripple.style.top = `${clientY - rect.top - size / 2}px`;
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple-animation 0.6s ease-out';
    ripple.style.pointerEvents = 'none';

    target.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  }, []);

  if (!tomatoes || tomatoes.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
        <p className="text-stone-400 text-lg">Загрузка томатов...</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        }

        @keyframes card-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-card-in {
          animation: card-in 0.4s ease-out both;
        }
      `}</style>

      <div className="space-y-6">
        <div ref={topAnchorRef} className="sr-only" aria-hidden />

        {/* Мобильный sticky-блок с улучшенным позиционированием */}
        <div className="sticky top-[60px] z-30 bg-white pt-2 pb-2 lg:hidden shadow-sm">
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
          <aside className="hidden lg:block w-full lg:w-80 xl:w-96">
            <div className="lg:sticky lg:top-4">
              <Filters
                filters={filters}
                onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
                onReset={resetFilters}
                totalCount={tomatoes.length}
                filteredCount={total}
                smartCounts={smartCounts}
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

            {activeFilterLabels.length > 0 && (
              <div className="mb-4 flex items-center gap-2 flex-wrap bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
                <span className="font-medium">Применены фильтры:</span>
                <span>{activeFilterLabels.join(', ')}</span>
                <button
                  onClick={resetFilters}
                  className="ml-auto text-amber-700 hover:text-amber-900 p-1 rounded-full hover:bg-amber-100 transition"
                  title="Сбросить все фильтры"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            )}

            <div className="text-left text-sm text-stone-500 mb-4">
              Найдено сортов: <span className="font-bold text-emerald-600">{total}</span>
            </div>

            {total === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                <p className="text-stone-500 text-lg mb-4">😔 Ничего не найдено</p>
                <p className="text-stone-400 text-sm mb-6">Попробуйте изменить или сбросить фильтры</p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
                >
                  <RotateCcw size={18} />
                  Сбросить все фильтры
                </button>
              </div>
            ) : (
              <>
                <div
                  ref={cardsContainerRef}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  onTouchStart={handleCardsTouchStart}
                  onTouchMove={handleCardsTouchMove}
                  onTouchEnd={handleCardsTouchEnd}
                >
                  {visible.map((tomato, index) => {
                    const isInCart = cartItems.some(
                      (item) => item.tomato.id === tomato.id
                    );

                    return (
                      <div
                        key={tomato.id}
                        className="group bg-white rounded-2xl border shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col relative animate-card-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onMouseDown={createRipple}
                        onTouchStart={createRipple}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(tomato);
                              }}
                              disabled={isInCart}
                              className="w-full py-2 rounded-lg bg-stone-800 text-white disabled:bg-stone-300 disabled:cursor-not-allowed sm:bg-emerald-600 sm:text-white hover:bg-emerald-700 transition"
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
                  <div className="flex flex-col items-center gap-2 pt-4">
                    <div className="flex justify-center items-center gap-2 sm:gap-4">
                      <button
                        onClick={() => goPage(1)}
                        disabled={page === 1}
                        className="p-2 rounded-lg border disabled:opacity-50 hidden sm:block"
                      >
                        <ChevronsLeft size={16} />
                      </button>

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

                      <button
                        onClick={() => goPage(totalPages)}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border disabled:opacity-50 hidden sm:block"
                      >
                        <ChevronsRight size={16} />
                      </button>

                      <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 ml-1 sm:ml-2">
                        <input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={jumpInput}
                          onChange={(e) => setJumpInput(e.target.value)}
                          placeholder="№"
                          className="w-12 sm:w-14 text-center border border-stone-200 rounded-lg px-1 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-lg border hover:bg-stone-50"
                        >
                          <ChevronsRight size={16} />
                        </button>
                      </form>
                    </div>
                    <div className="text-xs text-stone-400 flex items-center gap-1 lg:hidden">
                      <span>↔</span>
                      <span>Листайте страницы свайпом влево-вправо</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Мобильный Bottom Sheet */}
        {isFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setIsFiltersOpen(false)}
            />
            <div
              ref={sheetRef}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
              onTouchStart={handleSheetTouchStart}
              onTouchMove={handleSheetTouchMove}
              onTouchEnd={handleSheetTouchEnd}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1.5 bg-stone-300 rounded-full" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-stone-800 text-lg">Фильтры</h3>
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                <Filters
                  filters={filters}
                  onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
                  onReset={resetFilters}
                  totalCount={tomatoes.length}
                  filteredCount={total}
                  smartCounts={smartCounts}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Catalog;
