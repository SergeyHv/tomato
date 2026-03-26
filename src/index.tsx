import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Извлекаем ID из URL
const getUrlId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

root.render(
  <React.StrictMode>
    <App initialId={getUrlId()} />
  </React.StrictMode>
);
