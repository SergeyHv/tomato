
import React from 'react';
import { ShoppingBasket, Sprout, Database } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, onOpenAdmin }) => {
  return (
    <header className="sticky top-0 bg-gradient-to-r from-tomato-600 to-tomato-700 shadow-md z-30 border-b border-tomato-800 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/20">
            <Sprout size={24} className="text-white" />
          </div>
          <div>
             <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide leading-none shadow-black/10 drop-shadow-sm">
               Каталог томатов
             </h1>
             <p className="text-[10px] sm:text-xs text-tomato-100 font-medium tracking-wider uppercase opacity-90">
               Коллекционные сорта
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            {onOpenAdmin && (
                <button 
                    onClick={onOpenAdmin}
                    className="p-2 text-tomato-100 hover:text-white hover:bg-white/10 rounded-full transition"
                    title="Сканер сортов"
                >
                    <Database size={20} />
                </button>
            )}

            <button 
            onClick={onOpenCart}
            className="group flex items-center gap-2 bg-white text-tomato-700 px-4 py-2 rounded-full hover:bg-tomato-50 hover:shadow-lg transition-all duration-200 shadow-sm border border-tomato-800/20"
            >
            <div className="relative">
                <ShoppingBasket size={20} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-tomato-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white">
                    {cartCount}
                </span>
                )}
            </div>
            <span className="hidden sm:inline font-bold text-sm">Мой список</span>
            </button>
        </div>
      </div>
    </header>
  );
};
