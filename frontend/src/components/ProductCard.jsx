import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      {/* Изображение */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.images[0] || 'https://via.placeholder.com/400?text=Нет+фото'} 
          alt={product.title}
          className="w-full h-full object-cover"
        />
        {!product.stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
              Закончилось
            </span>
          </div>
        )}
      </div>

      {/* Информация */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-red-500 font-bold uppercase mb-1">{product.category}</div>
        <h3 className="font-bold text-gray-800 mb-2 leading-tight min-h-[2.5rem]">
          {product.title}
        </h3>
        
        {/* Теги */}
        <div className="flex flex-wrap gap-1 mb-4">
          {product.tags.map((tag, i) => (
            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Цена и кнопка */}
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">{product.price} €</span>
          </div>
          <button 
            onClick={() => onAddToCart(product)}
            disabled={!product.stock}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
            title="Добавить в корзину"
          >
            🛒
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
