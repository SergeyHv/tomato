import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { Catalog } from './components/Catalog';
import { CartModal } from './components/CartModal';
import { DetailModal } from './components/DetailModal';
import { Tomato, FilterState, CartItem } from './types';
import { fetchTomatoes } from './services/api';

const App: React.FC = () => {
  const [tomatoes, setTomatoes] = useState<Tomato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    environment: '',
    ripening: '',
    color: '',
    type: '',
    growth: '',
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('tomato_cart_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedTomato, setSelectedTomato] = useState<Tomato | null>(null);

  useEffect(() => {
    fetchTomatoes()
      .then(data => {
        setTomatoes(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить каталог. Проверьте соединение.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('tomato_cart_v2', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.body.style.overflow = isFiltersOpen ? 'hidden' : '';
  }, [isFiltersOpen]);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      environment: '',
      ripening: '',
      color: '',
      type: '',
      growth: '',
    });
  }, []);

  const matchesEnvironment = (growth: string) => {
    if (!filters.environment) return true;
    if (filters.environment === 'ground') return growth === 'Гном' || growth === 'Дет';
    if (filters.environment === 'greenhouse')
      return growth === 'Индет' || growth === 'Среднерослый' || growth === 'Дет';
    if (filters.environment === 'both') return growth === 'Дет' || growth === 'Среднерослый';
    return true;
  };

  const filteredTomatoes = useMemo(() => {
    return tomatoes.filter(tomato => {
      const q = filters.search.toLowerCase();

      const matchesSearch =
        !q ||
        tomato.name.toLowerCase().includes(q) ||
        (tomato.originalName && tomato.originalName.toLowerCase().includes(q));

      const matchesRipening = filters.ripening
        ? tomato.ripening === filters.ripening
        : true;

      const matchesColor = filters.color ? tomato.color === filters.color : true;
      const matchesType = filters.type ? tomato.type === filters.type : true;
      const matchesGrowth = filters.growth ? tomato.growth === filters.growth : true;
      const matchesEnv = matchesEnvironment(tomato.growth);

      return (
        matchesSearch &&
        matchesRipening &&
        matchesColor &&
        matchesType &&
        matchesGrowth &&
        matchesEnv
      );
    });
  }, [filters, tomatoes]);

  const cartItemCount = cart.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">🍅</div>
          <p className="text-stone-500 font-medium">Загружаем каталог сортов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg">
          <p className="text-red-500 font-bold mb-2">Ошибка</p>
          <p className="text-stone-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={cartItemCount} onOpenCart={() => setIsCartOpen(true)} />

      {/* MOBILE FILTER BUTTON */}
      <div className="lg:hidden px-4 pt-4">
        <button
          onClick={() => setIsFiltersOpen(true)}
          className="w-full border border-stone-200 rounded-xl px-4 py-3 bg-white shadow-sm text-stone-700 font-medium"
        >
          Фильтры · Найдено {filteredTomatoes.length}
        </button>
      </div>

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* DESKTOP FILTERS */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24">
            <div className="max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
              <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                totalCount={tomatoes.length}
                filteredCount={filteredTomatoes.length}
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <Catalog
              tomatoes={filteredTomatoes}
              onAddToCart={(t) =>
                setCart(prev => [...prev, { tomato: t, quantity: 1 }])
              }
              onViewDetail={setSelectedTomato}
              cartItems={cart}
            />
          </main>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFiltersOpen(false)}
          />
          <div className="relative bg-white w-5/6 max-w-sm h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">Фильтры</div>
              <button onClick={() => setIsFiltersOpen(false)}>✕</button>
            </div>

            <Filters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              totalCount={tomatoes.length}
              filteredCount={filteredTomatoes.length}
            />
          </div>
        </div>
      )}

      {isCartOpen && (
        <CartModal
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemove={(id) =>
            setCart(prev => prev.filter(i => i.tomato.id !== id))
          }
          onClear={() => setCart([])}
        />
      )}

      {selectedTomato && (
        <DetailModal
          tomato={selectedTomato}
          onClose={() => setSelectedTomato(null)}
          onAddToCart={() =>
            setCart(prev => [...prev, { tomato: selectedTomato, quantity: 1 }])
          }
          isInCart={cart.some(i => i.tomato.id === selectedTomato.id)}
          onRemoveFromCart={() =>
            setCart(prev =>
              prev.filter(i => i.tomato.id !== selectedTomato.id)
            )
          }
        />
      )}
    </div>
  );
};

export default App;
