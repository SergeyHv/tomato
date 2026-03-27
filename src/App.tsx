import React, { useState, useEffect } from 'react';

function App({ initialId }: { initialId: string | null }) {
  const [tomatoes, setTomatoes] = useState<any[]>([]);
  const [selectedTomato, setSelectedTomato] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных ОДИН РАЗ при монтировании
  useEffect(() => {
    fetch('/tomatoes_data.json')
      .then(response => response.json())
      .then(data => {
        console.log('Загруженные данные:', data); // Для отладки
        setTomatoes(data);
        setIsLoading(false);
        
        // Проверяем initialId ТОЛЬКО ПОСЛЕ загрузки данных
        if (initialId && data.length > 0) {
          const foundTomato = data.find(tomato => tomato.id === initialId);
          if (foundTomato) {
            setSelectedTomato(foundTomato);
          }
        }
      })
      .catch(error => {
        console.error('Ошибка загрузки данных:', error);
        setIsLoading(false);
      });
  }, []); // [] - пустой массив зависимостей = выполнится 1 раз

  // Обработчик открытия модального окна
  const openTomatoModal = (tomato: any) => {
    setSelectedTomato(tomato);
    // Добавляем id в URL для возможности делиться ссылкой
    window.history.pushState({}, '', `/?id=${tomato.id}`);
  };

  // Обработчик закрытия модального окна
  const closeTomatoModal = () => {
    setSelectedTomato(null);
    // Возвращаем чистый URL без параметра id
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог томатов</h1>
      
      {/* Список томатов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-center col-span-full">Загрузка данных...</p>
        ) : (
          tomatoes.map(tomato => (
            <div 
              key={tomato.id} 
              className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow bg-white"
              onClick={() => openTomatoModal(tomato)}
            >
              <div className="flex items-start gap-3">
                {tomato.imageUrl && (
                  <img 
                    src={tomato.imageUrl} 
                    alt={tomato.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{tomato.name}</h2>
                  <p className="text-gray-600">{tomato.originalName}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      {tomato.color}
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      {tomato.type}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {tomato.growth}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Модальное окно */}
      {selectedTomato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <button 
                onClick={closeTomatoModal}
                className="float-right text-gray-500 hover:text-gray-700 text-2xl"
                aria-label="Закрыть"
              >
                ✕
              </button>
              <div className="flex flex-col md:flex-row gap-6">
                {selectedTomato.imageUrl && (
                  <div className="md:w-1/3">
                    <img 
                      src={selectedTomato.imageUrl} 
                      alt={selectedTomato.name} 
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                <div className="md:w-2/3">
                  <h2 className="text-2xl font-bold mb-2">{selectedTomato.name}</h2>
                  <p className="text-lg text-gray-600 mb-4">{selectedTomato.originalName}</p>
                  
                  {/* Описание */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Описание сорта</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedTomato.description || selectedTomato.fullDescription || "Описание недоступно"}
                    </p>
                  </div>
                  
                  {/* Характеристики */}
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
                    {selectedTomato.growth && (
                      <div className="bg-green-50 p-3 rounded">
                        <div className="font-medium text-gray-500">Рост</div>
                        <div>{selectedTomato.growth} ({selectedTomato.height})</div>
                      </div>
                    )}
                    {selectedTomato.weight && (
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="font-medium text-gray-500">Вес</div>
                        <div>{selectedTomato.weight}</div>
                      </div>
                    )}
                    {selectedTomato.ripening && (
                      <div className="bg-yellow-50 p-3 rounded">
                        <div className="font-medium text-gray-500">Созревание</div>
                        <div>{selectedTomato.ripening}</div>
                      </div>
                    )}
                    {selectedTomato.origin && (
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="font-medium text-gray-500">Происхождение</div>
                        <div>{selectedTomato.origin}</div>
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
