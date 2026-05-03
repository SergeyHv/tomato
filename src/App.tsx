import React, { useState, useEffect } from 'react';
import { Catalog } from './components/Catalog';
import { CartModal } from './components/CartModal';
import { TOMATO_DATA } from './constants';
import { Tomato, CartItem } from './types';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedTomato, setSelectedTomato] = useState<Tomato | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id && TOMATO_DATA.length > 0) {
      const found = TOMATO_DATA.find((t) => t.id === id);
      if (found) setSelectedTomato(found);
    }
  }, []);

  const addToCart = (tomato: Tomato) => {
    setCartItems((prev) => {
      if (prev.some((item) => item.tomato.id === tomato.id)) return prev;
      return [...prev, { tomato, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.tomato.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const viewDetail = (tomato: Tomato) => {
    setSelectedTomato(tomato);
    window.history.pushState({}, '', `/?id=${tomato.id}`);
  };

  const closeDetail = () => {
    setSelectedTomato(null);
    window.history.pushState({}, '', '/');
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Хедер с кнопкой корзины */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-stone-800">🍅 Каталог томатов</h1>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            📋 Список
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Catalog
          tomatoes={TOMATO_DATA}
          cartItems={cartItems}
          onAddToCart={addToCart}
          onViewDetail={viewDetail}
        />
      </div>

      {/* Модалка корзины */}
      {isCartOpen && (
        <CartModal
          cart={cartItems}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onClear={clearCart}
        />
      )}

      {/* Модалка деталей сорта */}
      {selectedTomato && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="relative bg-stone-100 flex-shrink-0" style={{ height: '300px' }}>
              <img
                src={selectedTomato.imageUrl || `/images/${selectedTomato.id}.jpg`}
                alt={selectedTomato.name}
                className="w-full h-full object-cover object-left"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <button
                onClick={closeDetail}
                className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded hover:bg-black/70"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4" style={{ overflowY: 'auto', flex: 1 }}>
              <h2 className="text-2xl font-bold">{selectedTomato.name}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedTomato.fullDescription || selectedTomato.description || 'Описание отсутствует'}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                <div>
                  <div className="text-gray-500">Рост</div>
                  <div>{selectedTomato.height || '?'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Вес</div>
                  <div>{selectedTomato.weight || '?'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
