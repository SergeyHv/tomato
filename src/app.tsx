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
          <p>Загрузка...</p>
        ) : (
          tomatoes.map(tomato => (
            <div 
              key={tomato.id} 
              className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => openTomatoModal(tomato)}
            >
              <h2 className="text-xl font-semibold">{tomato.name}</h2>
              {tomato.variety && <p className="text-gray-600">{tomato.variety}</p>}
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
                className="float-right text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-4">{selectedTomato.name}</h2>
              <div className="space-y-4">
                {selectedTomato.variety && (
                  <p><strong>Вид:</strong> {selectedTomato.variety}</p>
                )}
                {selectedTomato.description && (
                  <p>{selectedTomato.description}</p>
                )}
                {/* Добавьте остальные поля по необходимости */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
