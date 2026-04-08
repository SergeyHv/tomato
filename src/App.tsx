import React, { useState, useEffect } from 'react';

function App({ initialId }: { initialId: string | null }) {
  const [tomatoes, setTomatoes] = useState<any[]>([]);
  const [selectedTomato, setSelectedTomato] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      {/* КАРТОЧКИ */}
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
              {/* ФОТО */}
              <div className="relative h-64 bg-stone-100 overflow-hidden">
                <img
                  src={`/images/${tomato.id}.jpg`}
                  alt={tomato.name}
                  className="w-full h-full object-cover object-left group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />

                {/* ГРАДИЕНТ + НАЗВАНИЕ */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h3 className="text-white font-semibold text-base leading-tight">
                    {tomato.name}
                  </h3>
                </div>
              </div>

              {/* НИЗ */}
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

      {/* МОДАЛКА = СТРАНИЦА СОРТА */}
      {selectedTomato && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full overflow-hidden">
            {/* БОЛЬШОЕ ФОТО */}
            <div className="relative h-80 bg-stone-100">
              <img
                src={`/images/${selectedTomato.id}.jpg`}
                className="w-full h-full object-cover object-left"
              />

              <button
                onClick={closeTomatoModal}
                className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* КОНТЕНТ */}
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold">
                {selectedTomato.name}
              </h2>

              <div className="flex gap-2 flex-wrap text-sm">
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded">
                  {selectedTomato.color}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded">
                  {selectedTomato.type}
                </span>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {selectedTomato.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                <div>
                  <div className="text-gray-500">Рост</div>
                  <div className="font-medium">
                    {selectedTomato.height} см
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Вес</div>
                  <div className="font-medium">
                    {selectedTomato.weight} г
                  </div>
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
