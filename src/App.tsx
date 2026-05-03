{selectedTomato && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl max-w-3xl w-full" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
      <div className="relative bg-stone-100 flex-shrink-0" style={{ height: '300px' }}>
        <img
          src={selectedTomato.imageUrl || `/images/${selectedTomato.id}.jpg`}
          alt={selectedTomato.name}
          className="w-full h-full object-cover object-left"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <button
          onClick={closeTomatoModal}
          className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded hover:bg-black/70"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-4" style={{ overflowY: 'auto', flex: 1 }}>
        <h2 className="text-2xl font-bold">
          {selectedTomato.name}
        </h2>

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {selectedTomato.description || 'Описание отсутствует'}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
          <div>
            <div className="text-gray-500">Рост</div>
            <div>{selectedTomato.height || '?'} см</div>
          </div>
          <div>
            <div className="text-gray-500">Вес</div>
            <div>{selectedTomato.weight || '?'} г</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
