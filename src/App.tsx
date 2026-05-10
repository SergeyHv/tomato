{selectedTomato && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl max-w-3xl w-full" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
      <div className="relative bg-stone-100 flex-shrink-0" style={{ height: 'clamp(300px, 50vh, 500px)' }}>
        <img
          src={selectedTomato.imageUrl || `/images/${selectedTomato.id}.jpg`}
          alt={selectedTomato.name}
          className="w-full h-full object-contain bg-stone-100"
          onError={e => (e.currentTarget.style.display = 'none')}
        />
        <button 
          onClick={closeDetail} 
          className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded hover:bg-black/70"
        >
          ✕
        </button>
      </div>
      <div className="p-6 overflow-y-auto flex-1">
        <h2 className="text-2xl font-bold">{selectedTomato.name}</h2>
        <p className="mt-2 text-gray-700 leading-relaxed">
          {selectedTomato.fullDescription || selectedTomato.description || 'Описание отсутствует'}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Рост:</div>
          <div>{selectedTomato.height || 'Не указано'}</div>
          <div className="text-gray-500">Вес:</div>
          <div>{selectedTomato.weight || 'Не указано'}</div>
        </div>
        {/* Кнопка добавления в список */}
        <div className="mt-6 pt-4 border-t">
          <button
            onClick={() => addToCart(selectedTomato)}
            disabled={cartItems.some(item => item.tomato.id === selectedTomato.id)}
            className="w-full py-3 rounded-lg bg-stone-800 text-white font-medium disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-stone-700 transition"
          >
            {cartItems.some(item => item.tomato.id === selectedTomato.id) ? '✅ Уже в списке' : '📋 Добавить в список'}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
