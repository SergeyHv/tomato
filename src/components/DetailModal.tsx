
import React from 'react';
import { X, Scale, Sprout, Palette, Plus, Trash2, ImageOff, Globe } from 'lucide-react';
import { Tomato } from '../types';
import { localize } from '../utils/localization';

interface DetailModalProps {
  tomato: Tomato;
  onClose: () => void;
  onAddToCart: () => void;
  isInCart: boolean;
  onRemoveFromCart: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ tomato, onClose, onAddToCart, isInCart, onRemoveFromCart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-all backdrop-blur-sm"
        >
          <X size={20} />
        </button>

        {/* Левая часть: Фото (50% ширины, фото целиком) */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-auto bg-stone-100 flex items-center justify-center p-4 relative">
           {tomato.imageUrl ? (
              <img 
                src={tomato.imageUrl} 
                alt={tomato.name} 
                className="w-full h-full object-contain drop-shadow-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.fallback-image');
                  fallback?.classList.remove('hidden');
                }}
              />
           ) : null}
           <div className={`fallback-image flex flex-col items-center justify-center text-stone-300 ${tomato.imageUrl ? 'hidden' : ''}`}>
              <ImageOff size={48} />
              <span className="text-sm font-medium mt-2">Нет фото</span>
           </div>
        </div>

        {/* Правая часть: Информация */}
        <div className="w-full md:w-1/2 flex flex-col h-full bg-white">
          <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar">
            
            <div className="mb-2 flex items-center gap-2">
               <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider border border-stone-200">
                  {localize(tomato.type)}
               </span>
               <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider border border-stone-200">
                  {localize(tomato.growth)}
               </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 mb-4 leading-tight">
              {tomato.name}
            </h2>
            
            {/* Компактная сетка характеристик */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <div className="text-tomato-500"><Palette size={16}/></div>
                <div>
                  <div className="text-[9px] text-stone-400 uppercase font-bold leading-none mb-0.5">Цвет</div>
                  <div className="text-xs font-bold text-stone-700 leading-none">{localize(tomato.color)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <div className="text-emerald-600"><Sprout size={16}/></div>
                <div>
                  <div className="text-[9px] text-stone-400 uppercase font-bold leading-none mb-0.5">Куст</div>
                  <div className="text-xs font-bold text-stone-700 leading-none">{localize(tomato.growth)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <div className="text-amber-500"><Scale size={16}/></div>
                <div>
                  <div className="text-[9px] text-stone-400 uppercase font-bold leading-none mb-0.5">Вес</div>
                  <div className="text-xs font-bold text-stone-700 leading-none">{tomato.weight}</div>
                </div>
              </div>

              {tomato.origin && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="text-blue-500"><Globe size={16}/></div>
                  <div>
                    <div className="text-[9px] text-stone-400 uppercase font-bold leading-none mb-0.5">Происхождение</div>
                    <div className="text-xs font-bold text-stone-700 leading-none truncate max-w-[100px]">{tomato.origin}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-stone prose-sm">
               <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-2">Описание сорта</h3>
               <p className="text-stone-600 leading-relaxed whitespace-pre-line text-sm">
                 {tomato.description}
               </p>
            </div>
          </div>

          {/* Футер модалки (прижат к низу) */}
          <div className="mt-auto p-4 md:p-6 border-t border-stone-100 bg-stone-50">
            {isInCart ? (
                <button 
                  onClick={onRemoveFromCart}
                  className="w-full bg-white text-rose-600 border border-rose-200 px-4 py-3 rounded-xl font-bold hover:bg-rose-50 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Trash2 size={18} /> Убрать из списка
                </button>
            ) : (
                <button 
                  onClick={onAddToCart}
                  className="w-full bg-tomato-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-tomato-700 transition shadow-lg shadow-tomato-200 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                  <Plus size={18} /> Добавить в список
                </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
