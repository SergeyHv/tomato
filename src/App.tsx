import React, { useState, useEffect } from 'react';
import { Catalog } from './components/Catalog';
import { TOMATO_DATA } from './constants';
import { Tomato, CartItem } from './types';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedTomato, setSelectedTomato] = useState<Tomato | null>(null);

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

  const viewDetail = (tomato: Tomato) => {
    setSelectedTomato(tomato);
    window.history.pushState({}, '', `/?id=${tomato.id}`);
  };

  const closeDetail = () => {
    setSelectedTomato(null);
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог томатов</h1>

      <Catalog
        tomatoes={TOMATO_DATA}
        cartItems={cartItems}
        onAddToCart={addToCart}
        onViewDetail={viewDetail}
      />

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
