import React, { useState, useEffect } from 'react';
import { Catalog } from './components/Catalog';
import { CartModal } from './components/CartModal';
import { Tomato, CartItem } from './types';

function App() {
  const [tomatoes, setTomatoes] = useState<Tomato[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedTomato, setSelectedTomato] = useState<Tomato | null>(null);

  const parseCSV = (text: string) => {
    const rows = [];
    let current = '';
    let row: string[] = [];
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') insideQuotes = !insideQuotes;
      else if (char === ',' && !insideQuotes) {
        row.push(current);
        current = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (current || row.length) {
          row.push(current);
          rows.push(row);
          row = [];
          current = '';
        }
      } else current += char;
    }
    if (current || row.length) {
      row.push(current);
      rows.push(row);
    }
    return rows;
  };

  useEffect(() => {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSpEDrdN5bZsJsb6k6JQk4My96Tet3Sac8N4-BGcJ4KHcSrfeqKbLolME0CMb9lvfecYbay7R1bqYY/pub?output=csv';

    fetch(url)
      .then(res => res.text())
      .then(text => {
        const rows = parseCSV(text);
        const dataRows = rows.slice(1);
        const data: Tomato[] = dataRows
          .map(cols => {
            if (cols.length < 11) return null;
            return {
              id: cols[0],
              name: cols[1],
              originalName: cols[2],
              description: cols[3],
              fullDescription: cols[4],
              color: cols[5],
              type: cols[6],
              growth: cols[7],
              height: cols[8],
              weight: cols[9],
              imageUrl: cols[10],
              price: 0,
              ripening: cols[11] || '',
            } as Tomato;
          })
          .filter(Boolean);
        setTomatoes(data);
        setIsLoading(false);

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id && data.length) {
          const found = data.find(t => t.id === id);
          if (found) setSelectedTomato(found);
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки CSV:', err);
        setIsLoading(false);
      });
  }, []);

  const addToCart = (tomato: Tomato) => {
    setCartItems(prev => {
      if (prev.some(i => i.tomato.id === tomato.id)) return prev;
      return [...prev, { tomato, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(i => i.tomato.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const viewDetail = (tomato: Tomato) => {
    setSelectedTomato(tomato);
    window.history.pushState({}, '', `/?id=${tomato.id}`);
  };

  const closeDetail = () => {
    setSelectedTomato(null);
    window.history.pushState({}, '', '/');
  };

  const totalCartItems = cartItems.reduce((s, i) => s + i.quantity, 0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Загрузка 1300+ сортов...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🍅 Каталог томатов</h1>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-emerald-600 text-white px-4 py-2 rounded-lg"
          >
            Список ({totalCartItems})
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Catalog
          tomatoes={tomatoes}
          cartItems={cartItems}
          onAddToCart={addToCart}
          onViewDetail={viewDetail}
        />
      </div>

      {isCartOpen && (
        <CartModal
          cart={cartItems}
          onClose={() => setIsCartOpen(false)}
          onRemove={removeFromCart}
          onClear={clearCart}
        />
      )}

      {selectedTomato && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="relative bg-stone-100 flex-shrink-0" style={{ height: '300px' }}>
              <img
                src={selectedTomato.imageUrl || `/images/${selectedTomato.id}.jpg`}
                alt={selectedTomato.name}
                className="w-full h-full object-contain bg-stone-100"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
              <button 
                onClick={closeDetail} 
                className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded hover:bg-black/70"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold">{selectedTomato.name}</h2>
              <p className="mt-2 text-gray-700 leading-relaxed">
                {selectedTomato.fullDescription || selectedTomato.description || 'Описание отсутствует'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Рост:</div>
                <div>{selectedTomato.height || 'Не указано'}</div>
                <div className="text-gray-500">Вес:</div>
                <div>{selectedTomato.weight || 'Не указано'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
