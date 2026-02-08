import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { Catalog } from './components/Catalog';
import { NewsSidebar } from './components/NewsSidebar';
import { CartModal } from './components/CartModal';
import { DetailModal } from './components/DetailModal';
import { NEWS_DATA } from './constants';
import { Tomato, FilterState, CartItem } from './types';
import { fetchTomatoes } from './services/api';

const App: React.FC = () => {
  // Data State
  const [tomatoes, setTomatoes] = useState<Tomato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    environment: '',
    color: '',
    type: '',
    growth: '',
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('tomato_cart_v2');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedTomato, setSelectedTomato] = useState<Tomato | null>(null);

  // Load Data
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

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('tomato_cart_v2', JSON.stringify(cart));
  }, [cart]);

  // Handlers
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      environment: '',
      color: '',
      type: '',
      growth: '',
    });
  }, []);

  const addToCart = useCallback((tomato: Tomato) => {
    setCart(prev => {
      const existing = prev.find(item => item.tomato.id === tomato.id);
      if (existing) return prev;
      return [...prev, { tomato, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(item => item.tomato.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const handleOpenDetail = useCallback((tomato: Tomato) => {
    setSelectedTomato(tomato);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedTomato(null);
  }, []);

  // Derived State (Filtering — БЕЗ environment, ЭТАП 1)
  const filteredTomatoes = useMemo(() => {
    return tomatoes.filter(tomato => {
      const q = filters.search.toLowerCase();
      const matchesSearch =
        !q ||
        tomato.name.toLowerCase().includes(q) ||
        (tomato.originalName && tomato.originalName.toLowerCase().includes(q));

      const matchesColor = filters.color ? tomato.color === filters.color : true;
      const matchesType = filters.type ? tomato.type === filters.type : true;
      const matchesGrowth = filters.growth ? tomato.growth === filters.growth : true;

      return matchesSearch && matchesColor && matchesType && matchesGrowth;
    });
  }, [filters, tomatoes]);

  const cartItemCount = cart.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">🍅</div>
          <p className="text-stone-500 font-medium">Загружаем каталог сортов...</p>
          <p className="text-stone-400 text-xs mt-2">Пожалуйста, подождите</p>
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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-stone-800 text-white rounded-lg"
          >
            Обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          totalCount={tomatoes.length}
          filteredCount={filteredTomatoes.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <main className="lg:col-span-3">
            <Catalog
              tomatoes={filteredTomatoes}
              onAddToCart={addToCart}
              onViewDetail={handleOpenDetail}
              cartItems={cart}
            />
          </main>

          <aside className="lg:col-span-1 sticky top-24">
            <NewsSidebar news={NEWS_DATA} />
          </aside>
        </div>
      </div>

      {isCartOpen && (
        <CartModal
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onClear={clearCart}
        />
      )}

      {selectedTomato && (
        <DetailModal
          tomato={selectedTomato}
          onClose={handleCloseDetail}
          onAddToCart={() => addToCart(selectedTomato)}
          isInCart={cart.some(i => i.tomato.id === selectedTomato.id)}
          onRemoveFromCart={() => removeFromCart(selectedTomato.id)}
        />
      )}
    </div>
  );
};

export default App;
