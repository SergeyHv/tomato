import React, { useState } from 'react';
import { Tomato, CartItem } from '../types';
import { Plus, Info, Check, ImageOff, Loader2 } from 'lucide-react';
import { localize } from '../utils/localization';

interface CatalogProps {
  tomatoes: Tomato[];
  cartItems: CartItem[];
  onAddToCart: (tomato: Tomato) => void;
  onViewDetail: (tomato: Tomato) => void;
}

const TomatoImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-300">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}

      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 bg-stone-100">
          <ImageOff size={32} />
          <span className="text-xs font-medium mt-1">Нет фото</span>
        </div>
      )}
    </>
  );
};

export const Catalog: React.FC<CatalogProps> = ({
  tomatoes,
  cartItems,
  onAddToCart,
  onViewDetail,
}) => {
  if (tomatoes.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
        <p className="text-stone-400 text-lg">Ничего не найдено.</p>
        <p className="text-stone-300 text-sm mt-2">Попробуйте изменить фильтры.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {tomatoes.map((tomato) => {
        const isInCart = cartItems.some(
          (item) => item.tomato.id === tomato.id
        );

        let badgeColor = 'bg-stone-100 text-stone-800';
        if (tomato.color === 'Red') badgeColor = 'bg-red-100 text-red-800';
        if (tomato.color === 'Green') badgeColor = 'bg-green-100 text-green-800';
        if (tomato.color === 'Yellow')
          badgeColor = 'bg-yellow-100 text-yellow-800';
        if (tomato.color === 'Orange')
          badgeColor = 'bg-orange-100 text-orange-800';
        if (tomato.color.includes('Black'))
          badgeColor = 'bg-slate-800 text-white';

        return (
          <div
            key={tomato.id}
            className="group bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div
              className="relative h-48 overflow-hidden bg-stone-100 cursor-pointer"
              onClick={() => onViewDetail(tomato)}
            >
              {tomato.imageUrl ? (
               <img src={tomato.imageUrl} alt={tomato.name} className="w-full h-full object-cover" />

              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 bg-stone-100">
                  <ImageOff size={32} />
                  <span className="text-xs font-medium mt-1">Нет фото</span>
                </div>
              )}

              {isInCart && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 z-10">
                  <Check size={12} /> В списке
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-end z-10">
                <button className="text-white text-xs flex items-center gap-1 hover:underline">
                  <Info size={14} /> Подробнее
                </button>
              </div>
            </div>

            <div className="p-4 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3
                    className="font-bold text-stone-800 text-lg leading-tight group-hover:text-tomato-600 transition-colors cursor-pointer"
                    onClick={() => onViewDetail(tomato)}
                  >
                    {tomato.name}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${badgeColor}`}
                    >
                      {localize(tomato.color)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                      {localize(tomato.type)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => onAddToCart(tomato)}
                  disabled={isInCart}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                    isInCart
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                      : 'bg-stone-800 text-white hover:bg-tomato-600 active:bg-tomato-700'
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check size={16} /> Добавлено
                    </>
                  ) : (
                    <>
                      <Plus size={16} /> В список
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
