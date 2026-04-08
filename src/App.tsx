import React, { useState, useEffect } from 'react';

function App({ initialId }: { initialId: string | null }) {
  const [tomatoes, setTomatoes] = useState<any[]>([]);
  const [selectedTomato, setSelectedTomato] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s]/gi, '')
      .replace(/\s+/g, '_')
      .replace(/ё/g, 'e')
      .replace(/й/g, 'i')
      .replace(/ц/g, 'c')
      .replace(/у/g, 'u')
      .replace(/к/g, 'k')
      .replace(/е/g, 'e')
      .replace(/н/g, 'n')
      .replace(/г/g, 'g')
      .replace(/ш/g, 'sh')
      .replace(/щ/g, 'sh')
      .replace(/з/g, 'z')
      .replace(/х/g, 'h')
      .replace(/ъ/g, '')
      .replace(/ф/g, 'f')
      .replace(/ы/g, 'y')
      .replace(/в/g, 'v')
      .replace(/а/g, 'a')
      .replace(/п/g, 'p')
      .replace(/р/g, 'r')
      .replace(/о/g, 'o')
      .replace(/л/g, 'l')
      .replace(/д/g, 'd')
      .replace(/ж/g, 'zh')
      .replace(/э/g, 'e')
      .replace(/я/g, 'ya')
      .replace(/ч/g, 'ch')
      .replace(/с/g, 's')
      .replace(/м/g, 'm')
      .replace(/и/g, 'i')
      .replace(/т/g, 't')
      .replace(/ь/g, '')
      .replace(/б/g, 'b')
      .replace(/ю/g, 'yu');
  };

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
    const url =
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vShspJqmXJSwF9Sb4Y9yHM2Az6ERth1iNCgY3xBk5yE0O76xbvIgyc2nQlCPJhGncQs67jp-j42Mg2W/pub?output=csv';

    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        const rows = parseCSV(text);
        const dataRows = rows.slice(1);

        const data = dataRows
          .map((cols) => {
            if (cols.length < 7) return null;
            return {
              id: cols[0],
              name: cols[1],
              description: cols[2],
              color: cols[3],
              type: cols[4],
              height: cols[5],
              weight: cols[6],
            };
          })
          .filter(Boolean);

        setTomatoes(data);
        setIsLoading(false);

        if (initialId && data.length > 0) {
          const found = data.find((t: any) => t.id === initialId);
          if (found) setSelectedTomato(found);
        }
      })
      .catch(() => setIsLoading(false));
  }, []);

  const openTomatoModal = (tomato: any) => {
    setSelectedTomato(tomato);
    window.history.pushState({}, '', `/?id=${tomato.id}`);
  };

  const closeTomatoModal = () => {
    setSelectedTomato(null);
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог томатов</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-center col-span-full">Загрузка...</p>
        ) : (
          tomatoes.map((tomato) => (
            <div
              key={tomato.id}
              className="group bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden cursor-pointer"
              onClick={() => openTomatoModal(tomato)}
            >
              {/* КАРТИНКА */}
              <div className="relative h-56 bg-stone-100 overflow-hidden">
                <img
                  src={`/images/${slugify(tomato.name)}.jpg`}
                  alt={tomato.name}
                  className="w-full h-full object-cover object-left group-hover:scale-105 transition"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />

                {/* ГРАДИЕНТ */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <h3 className="text-white font-semibold text-sm">
                    {tomato.name}
                  </h3>
                </div>
              </div>

              {/* НИЖНИЙ БЛОК */}
              <div className="p-4 space-y-2">
                <div className="flex gap-2 flex-wrap text-xs">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                    {tomato.color}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {tomato.type}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  {tomato.height} см • {tomato.weight} г
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTomato && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full overflow-hidden">
            <div className="p-4">
              <button
                onClick={closeTomatoModal}
                className="float-right text-xl"
              >
                ✕
              </button>

              <img
                src={`/images/${slugify(selectedTomato.name)}.jpg`}
                className="w-full rounded mb-4 object-left"
              />

              <h2 className="text-xl font-bold mb-2">
                {selectedTomato.name}
              </h2>

              <p className="text-gray-600 mb-4">
                {selectedTomato.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Цвет: {selectedTomato.color}</div>
                <div>Тип: {selectedTomato.type}</div>
                <div>Рост: {selectedTomato.height} см</div>
                <div>Вес: {selectedTomato.weight} г</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
