import React, { useState, useEffect } from 'react';

function App({ initialTomatoId }: { initialTomatoId: string | null }) {
  const [tomatoData, setTomatoData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загрузка данных из JSON
  useEffect(() => {
    fetch('/tomatoes_data.json')
      .then(response => response.json())
      .then(data => {
        if (initialTomatoId) {
          const foundTomato = data.find((tomato: any) => tomato.id === initialTomatoId);
          if (foundTomato) {
            setTomatoData(foundTomato);
            setIsModalOpen(true); // Открываем модалку
          }
        }
      })
      .catch(error => console.error('Ошибка загрузки данных:', error));
  }, [initialTomatoId]);

  // JSX для модального окна
  return (
    <div>
      <h1>Каталог томатов</h1>
      {isModalOpen && tomatoData && (
        <div className="modal">
          <h2>{tomatoData.name}</h2>
          <p>{tomatoData.description}</p>
          <button onClick={() => setIsModalOpen(false)}>Закрыть</button>
        </div>
      )}
    </div>
  );
}

export default App;
