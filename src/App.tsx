import React, { useState, useEffect } from 'react';
import { Catalog } from './components/Catalog';
import { CartModal } from './components/CartModal';
import { Footer } from './components/Footer'; // <-- импорт футера
import { Tomato, CartItem } from './types';

const CART_STORAGE_KEY = 'tomato-cart';

// Словарь для перевода английских цветов в русские
const COLOR_MAP: Record<string, string> = {
  'Red': 'Красный',
  'Pink': 'Розовый',
  'Yellow': 'Жёлтый',
  'Orange': 'Оранжевый',
  'Black': 'Тёмный',
  'Green': 'Зелёный',
  'BiColor': 'Биколор',
  'Bi-color': 'Биколор',
  'Bicolor': 'Биколор',
  'White': 'Белый',
  'Purple': 'Фиолетовый',
  'Blue': 'Синий',
  'Brown': 'Коричневый',
};

// Унификация русских написаний цветов
const RUS_NORMALIZE: Record<string, string> = {
  'темный': 'Тёмный',
  'темная': 'Тёмный',
  'жёлтый': 'Жёлтый',
  'желтый': 'Жёлтый',
  'зелёный': 'Зелёный',
  'зеленый': 'Зелёный',
  'черный': 'Тёмный',
  'чёрный': 'Тёмный',
  'белый': 'Белый',
  'розовый': 'Розовый',
  'красный': 'Красный',
  'оранжевый': 'Оранжевый',
  'биколор': 'Биколор',
  'bicolor': 'Биколор',
};

function normalizeColor(raw: string | undefined): string {
  if (!raw) return 'Красный';
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (COLOR_MAP[trimmed]) return COLOR_MAP[trimmed];
  if (RUS_NORMALIZE[lower]) return RUS_NORMALIZE[lower];

  if (trimmed[0] === trimmed[0].toUpperCase() && trimmed.slice(1) === trimmed.slice(1).toLowerCase()) {
    return trimmed;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

const STANDARD_RIPENING = ['Раннеспелый', 'Среднеспелый', 'Позднеспелый'];

function App() {
  const [tomatoes, setTomatoes] = useState<Tomato[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedTomato, setSelectedTomato] = useState<Tomato | null>(null);
  const [infoBanner, setInfoBanner] = useState<{ title: string; text: string } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Ошибка сохранения корзины:', e);
    }
  }, [cartItems]);

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
    const PUBLISHED_BASE =
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vTSpEDrdN5bZsJsb6k6JQk4My96Tet3Sac8N4-BGcJ4KHcSrfeqKbLolME0CMb9lvfecYbay7R1bqYY/pub?output=csv';

    const loadCatalog = fetch(PUBLISHED_BASE + '&gid=0')
      .then(res => res.text())
      .then(text => {
        const rows = parseCSV(text);
        if (rows.length < 2) return [];
        const headers = rows[0];
        const dataRows = rows.slice(1);
        const colIndex = (name: string) => {
          const idx = headers.findIndex((h: string) => h.trim().toLowerCase() === name.toLowerCase());
          return idx !== -1 ? idx : null;
        };
        return dataRows
          .map(cols => {
            const id = cols[colIndex('id') as number];
            if (!id) return null;
            const availableValue = cols[2]?.trim();
            const rawColor = cols[colIndex('color') as number];
            const rawRipening = cols[colIndex('ripening') as number] || '';

            let ripening = rawRipening.trim();
            if (!STANDARD_RIPENING.includes(ripening)) {
              ripening = 'Среднеспелый';
            }

            return {
              id,
              name: cols[colIndex('name') as number] || 'Без названия',
              description: cols[colIndex('description') as number] || '',
              color: normalizeColor(rawColor),
              type: cols[colIndex('type') as number] || 'Classic',
              growth: cols[colIndex('growth') as number] || 'Среднерослый',
              height: cols[colIndex('height') as number] || '?',
              weight: cols[colIndex('weight') as number] || '?',
              imageUrl: cols[colIndex('imageUrl') as number] || '',
              price: 0,
              origin: 'Любительский сорт',
              ripening,
              ocrText: cols[colIndex('ocr_text') as number] || '',
              isNew: (cols[colIndex('новинка')] || '').trim().toLowerCase() === 'да',
              isAvailable: !!availableValue,
            } as Tomato;
          })
          .filter(Boolean);
      });

    const loadNews = fetch(PUBLISHED_BASE + '&gid=1103458362')
      .then(res => res.text())
      .then(rawCsv => {
        const rows = parseCSV(rawCsv);
        if (rows.length < 2) return null;
        const headers = rows[0];
        const titleIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'заголовок');
        const textIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'текст');
        if (titleIdx === -1 || textIdx === -1) return null;
        const firstRow = rows[1];
        const title = firstRow[titleIdx]?.trim();
        const newsText = firstRow[textIdx]?.trim();
        if (!title && !newsText) return null;
        return { title: title || '', text: newsText || '' };
      })
      .catch(() => null);

    Promise.all([loadCatalog, loadNews])
      .then(([catalogData, newsData]) => {
        setTomatoes(catalogData);
        setInfoBanner(newsData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки данных:', err);
        setIsLoading(false);
      });
  }, []);

  const addToCart = (tomato: Tomato) => {
    setCartItems(prev =>
      prev.some(i => i.tomato.id === tomato.id) ? prev : [...prev, { tomato, quantity: 1 }]
    );
  };
  const removeFromCart = (id: string) => setCartItems(prev => prev.filter(i => i.tomato.id !== id));
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
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-5 flex justify-between items-center">
            <div className="h-8 bg-stone-200 rounded w-48 animate-pulse" />
            <div className="h-9 bg-stone-200 rounded w-24 animate-pulse" />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 h-24 bg-stone-100 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col animate-pulse">
                <div className="h-56 bg-stone-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-200 rounded w-1/2" />
                  <div className="pt-4">
                    <div className="h-10 bg-stone-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🍅🌶️ Каталог томатов и перцев</h1>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-emerald-600 text-white px-4 py-2 rounded-lg"
          >
            Список ({totalCartItems})
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-1">
        {infoBanner && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2">
              <span>📢</span> {infoBanner.title}
            </h2>
            <p className="mt-2 text-amber-900 whitespace-pre-line">{infoBanner.text}</p>
          </div>
        )}

        <Catalog
          tomatoes={tomatoes}
          cartItems={cartItems}
          onAddToCart={addToCart}
          onViewDetail={viewDetail}
        />
      </div>

      <Footer /> {/* <-- Футер */}

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
          <div
            className="bg-white rounded-xl max-w-3xl w-full"
            style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            <div
              className="relative bg-stone-100 flex-shrink-0"
              style={{ height: 'clamp(300px, 60vh, 600px)' }}
            >
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
              <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedTomato.description || 'Описание отсутствует'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Рост:</div>
                <div>{selectedTomato.height || 'Не указано'}</div>
                <div className="text-gray-500">Вес:</div>
                <div>{selectedTomato.weight || 'Не указано'}</div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => addToCart(selectedTomato)}
                  disabled={cartItems.some(i => i.tomato.id === selectedTomato.id)}
                  className="w-full py-2 rounded-lg bg-emerald-600 text-white disabled:bg-stone-300"
                >
                  {cartItems.some(i => i.tomato.id === selectedTomato.id)
                    ? '✅ Уже в списке'
                    : '➕ В список заказа'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
