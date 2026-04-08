import React, { useState, useEffect } from 'react';

function App({ initialId }: { initialId: string | null }) {
  const [tomatoes, setTomatoes] = useState<any[]>([]);
  const [selectedTomato, setSelectedTomato] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** slugify для фото */
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

  /** НОВОЕ: безопасный CSV парсер */
  const parseCSV = (text: string) => {
    const rows = [];
    let current = '';
    let row: string[] = [];
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(current);
        current = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (current || row.length) {
          row.push(current);
          rows.push(row);
          row = [];
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current || row.length) {
      row.push(current);
      rows.push(row);
    }

    return rows;
  };

  /** загрузка из Google Sheets */
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
          const foundTomato = data.find(
            (tomato: any) => tomato.id === initialId
          );
          if (foundTomato) {
            setSelectedTomato(foundTomato);
          }
        }
      })
      .catch((error) => {
        console.error('Ошибка загрузки данных:', error);
        setIsLoading(false);
      });
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-center col-span-full">Загрузка данных...</p>
        ) : (
          tomatoes.map((tomato) => (
            <div
              key={tomato.id}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow bg-white"
              onClick={() => openTomatoModal(tomato)}
            >
              <div className="flex items-start gap-3">
                <img
                  src={`/images/${slugify(tomato.name)}.jpg`}
                  alt={tomato.name}
                  className="w-16 h-16 object-cover object-left rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />

                <div>
                  <h2 className="text-xl font-semibold">{tomato.name}</h2>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      {tomato.color}
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      {tomato.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedTomato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <button
                onClick={closeTomatoModal}
                className="float-right text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={`/images/${slugify(selectedTomato.name)}.jpg`}
                    alt={selectedTomato.name}
                    className="w-full h-auto rounded-lg object-left"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                <div className="md:w-2/3">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedTomato.name}
                  </h2>

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">
                      Описание сорта
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedTomato.description || 'Описание недоступно'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {selectedTomato.color && (
                      <div className="bg-red-50 p-3 rounded">
                        <div className="font-medium text-gray-500">Цвет</div>
                        <div>{selectedTomato.color}</div>
                      </div>
                    )}
                    {selectedTomato.type && (
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="font-medium text-gray-500">Тип</div>
                        <div>{selectedTomato.type}</div>
                      </div>
                    )}
                    {selectedTomato.height && (
                      <div className="bg-green-50 p-3 rounded">
                        <div className="font-medium text-gray-500">Рост</div>
                        <div>{selectedTomato.height} см</div>
                      </div>
                    )}
                    {selectedTomato.weight && (
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="font-medium text-gray-500">Вес</div>
                        <div>{selectedTomato.weight} г</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 bg-gray-50 rounded-b-lg">
              <button
                onClick={closeTomatoModal}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
