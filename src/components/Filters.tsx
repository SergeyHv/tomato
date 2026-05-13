import React from 'react';
import { FilterState } from '../types';
import { RotateCcw } from 'lucide-react';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
}) => {
  const isDefault =
    !filters.search &&
    !filters.environment &&
    !filters.ripening &&
    !filters.color &&
    !filters.type &&
    !filters.growth &&
    !filters.isNew;

  const presetButtons = [
    {
      label: '🌱 Новинки 2026',
      active: filters.isNew === true,
      onClick: () => onFilterChange({ isNew: !filters.isNew ? true : undefined }),
    },
    {
      label: 'Для открытого грунта',
      active: filters.environment === 'ground',
      onClick: () =>
        onFilterChange({
          environment: filters.environment === 'ground' ? '' : 'ground',
          growth: filters.environment === 'ground' ? '' : filters.growth,
        }),
    },
    {
      label: 'Раннеспелые',
      active: filters.ripening === 'Раннеспелый',
      onClick: () =>
        onFilterChange({
          ripening: filters.ripening === 'Раннеспелый' ? '' : 'Раннеспелый',
        }),
    },
    {
      label: 'Низкорослые',
      active: filters.growth === 'low',
      onClick: () =>
        onFilterChange({
          growth: filters.growth === 'low' ? '' : 'low',
        }),
    },
    {
      label: 'Черри',
      active: filters.type === 'Cherry',
      onClick: () =>
        onFilterChange({
          type: filters.type === 'Cherry' ? '' : 'Cherry',
        }),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-stone-800">Фильтры</h3>
        {!isDefault && (
          <button
            onClick={onReset}
            className="text-xs text-stone-500 hover:text-rose-500 flex items-center gap-1 transition"
          >
            <RotateCcw size={14} />
            Сбросить
          </button>
        )}
      </div>

      {/* Быстрые сценарии */}
      <div className="flex flex-wrap gap-2 mb-5">
        {presetButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              btn.active
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Цвет плода */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-stone-500 mb-2">Цвет плода</label>
        <select
          value={filters.color}
          onChange={(e) => onFilterChange({ color: e.target.value })}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Все</option>
          <option value="Красный">Красный</option>
          <option value="Розовый">Розовый</option>
          <option value="Жёлтый">Жёлтый</option>
          <option value="Оранжевый">Оранжевый</option>
          <option value="Тёмный">Тёмный</option>
          <option value="Зелёный">Зелёный</option>
          <option value="Биколор">Биколор</option>
        </select>
      </div>

      {/* Тип */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-stone-500 mb-2">Тип</label>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ type: e.target.value })}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Все</option>
          <option value="Cherry">Черри</option>
          <option value="Classic">Классический</option>
          <option value="Beefsteak">Биф</option>
          <option value="Plum">Сливка</option>
          <option value="Heart">Сердце</option>
          <option value="Классический">Классический (рус.)</option>
        </select>
      </div>

      {/* Рост */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-stone-500 mb-2">Рост</label>
        <select
          value={filters.growth}
          onChange={(e) => onFilterChange({ growth: e.target.value })}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Все</option>
          <option value="low">Низкорослые (Гном, Дет)</option>
          <option value="medium">Среднерослые</option>
          <option value="high">Индетерминантные</option>
        </select>
      </div>

      {/* Срок созревания */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-stone-500 mb-2">Срок созревания</label>
        <select
          value={filters.ripening}
          onChange={(e) => onFilterChange({ ripening: e.target.value })}
          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Все</option>
          <option value="Раннеспелый">Раннеспелый</option>
          <option value="Среднеспелый">Среднеспелый</option>
          <option value="Позднеспелый">Позднеспелый</option>
        </select>
      </div>

      <div className="text-xs text-stone-400 mt-2">
        Показано {filteredCount} из {totalCount} сортов
      </div>
    </div>
  );
};

export default Filters;
