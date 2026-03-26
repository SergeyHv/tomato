import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Предполагаем, что у вас есть App.tsx

// Функция для чтения параметра id из URL
function getUrlId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Получаем id из URL
const tomatoId = getUrlId();

// Рендерим приложение с передачей tomatoId
root.render(
  <React.StrictMode>
    <App initialTomatoId={tomatoId} />
  </React.StrictMode>
);
