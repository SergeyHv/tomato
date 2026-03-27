import React, { useState, useEffect } from 'react';
import { Tomato } from '../types';
import { X, Loader2, ImageOff } from 'lucide-react';
import { localize } from '../utils/localization';

interface DetailModalProps {
  tomato: Tomato | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ tomato, onClose }) => {
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (tomato) {
      setIsLoaded(false);
      setIsImageZoomed(false);
      setHasError(false);
    }
  }, [tomato]);

  if (!tomato) return null;

  const handleImageClick = () => {
    setIsImageZoomed(!isImageZoomed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-800">{tomato.name}</h2>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Закрыть"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Изображение с возможностью увеличения */}
            <div className="md:w-1/2">
              <div 
                className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
                  isImageZoomed ? 'bg-black' : ''                }`}
                onClick={handleImageClick}
              >
                <div className="relative" style={{ paddingTop: '100%' }}>
                  {isImageZoomed ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/80 z-10" />
                      <img 
                        src={tomato.imageUrl} 
                        alt={tomato.name} 
                        className="max-w-full max-h-[90vh] object-contain"
                      />
                    </div>
                  ) : (
                    <>
                      {!isLoaded && !hasError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-300">
                          <Loader2 className="animate-spin" size={24} />
                        </div>
                      )}

                      {!hasError && (
                        <img
                          src={tomato.imageUrl}
                          alt={tomato.name}
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
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
                  )}
                </div>
                
                {!isImageZoomed && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Кликните для увеличения
                  </div>
                )}
              </div>            </div>

            {/* Описание */}
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold mb-2">Описание сорта</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {tomato.description || tomato.fullDescription || "Описание недоступно"}
              </p>

              {/* Характеристики */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {tomato.color && (
                  <div className="bg-red-50 p-3 rounded">
                    <div className="font text-gray-500">Цвет</div>
                    <div>{localize(tomato.color)}</div>
                  </div>
                )}
                {tomato.type && (
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="font-medium text-gray-500">Тип</div>
                    <div>{localize(tomato.type)}</div>
                  </div>
                )}
                {tomato.growth && (
                  <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-gray-500">Рост</div>
                    <div>{localize(tomato.growth)} ({tomato.height})</div>
                  </div>
                )}
                {tomato.weight && (
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="font-medium text-gray-500">Вес</div>
                    <div>{tomato.weight}</div>
                  </div>
                )}
                {tomato.ripening && (
                  <div className="bg-yellow-50 p-3 rounded">
                    <div className="font-medium text-gray-500">Созревание</div>
                    <div>{localize(tomato.ripening)}</div>
                  </div>
                )}
                {tomato.origin && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-500">Происхождение</div>
                    <div>{tomato.origin}</div>
                  </div>
                )}
              </div>
            </div>
          </div>        </div>

        <div className="border-t p-4 bg-gray-50 rounded-b-xl">
          <button 
            onClick={onClose}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};