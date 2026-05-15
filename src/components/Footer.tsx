import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-50 border-t border-stone-200 mt-16">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-stone-500">
        <p className="mb-1">
          Алла, частный коллекционер томатов
        </p>
        <p>
          © 2026 Tomato Catalog | Беларусь | {' '}
          <a
            href="https://t.me/allatomatykollekcija"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition"
          >
            Telegram <span role="img" aria-label="telegram">✈️</span>
          </a>
        </p>
      </div>
    </footer>
  );
};
