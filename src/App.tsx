import React, { useState, useEffect } from 'react';
import { Catalog } from './components/Catalog';
import { CartModal } from './components/CartModal';
import { DetailModal } from './components/DetailModal';
import { Header } from './components/Header';
import { NewsSidebar } from './components/NewsSidebar';
import { Tomato, CartItem } from './types';

function App() {
  const [tomatoes, setTomatoes] = useState<Tomato[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTomato, setSelectedTomato] = useState<Tomato | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
      .then((res) => res.text())
      .then((text) => {
        const rows = parseCSV(text);
        const dataRows = rows.slice(1);

        const data = dataRows
          .map((cols, index) => {
            if (cols.length < 11) return null;
            return {
              id: cols[0] || String(index + 1),
              name: cols[1] || 'Без названия',
              originalName: cols[2] || '',
              description: cols[3] || '',
              fullDescription: cols[4] || '',
              color: cols[5] || 'Red',
              type: cols[6] || 'Classic',
              growth: cols[7] || 'Medium',
              height: cols[8] || '?',
              weight: cols[9] || '?',
              imageUrl: cols[10] || '',
              ripening: cols[11] || 'средний',
              environment: cols[12] || 'универсал',
            } as Tomato;
          })
          .filter(Boolean);

        setTomatoes(data);
        setIsLoading(false);

        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id && data.length > 0) {
          const found = data.find((t) => t.id === id);
          if (found) setSelectedTomato(found);
        }
      })
      .catch((err) => {
        console.error('Ошибка загрузки:', err);
        setIsLoading(false);
      });
  }, []);

  const addToCart = (tomato: Tomato) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.tomato.id === tomato.id);
      if (existing) {
        return prev.map((item) =>
          item.tomato.id === tomato.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { tomato, quantity: 1 }];
    });
  };

  const removeFromCart = (tomatoId: string) => {
    setCartItems((prev) => prev.filter((item) => item.tomato.id !== tomatoId));
  };

  const updateQuantity = (tomatoId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(tomatoId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.tomato.id === tomatoId ? { ...item, quantity } : item
      )
    );
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        cartItemsCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Catalog
              tomatoes={tomatoes}
              cartItems={cartItems}
              onAddToCart={addToCart}
              onViewDetail={viewDetail}
            />
          </div>
          <div className="lg:col-span-1">
            <NewsSidebar />
          </div>
        </div>
      </div>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />

      <DetailModal
        tomato={selectedTomato}
        onClose={closeDetail}
        onAddToCart={addToCart}
        isInCart={selectedTomato ? cartItems.some((i) => i.tomato.id === selectedTomato.id) : false}
      />
    </div>
  );
}

export default App;
