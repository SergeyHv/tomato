import React from 'react';
import { FilterState } from '../types';
import { localize } from '../utils/localization';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

const growthOptions = [
  { value: 'low', label: 'Низкие (до 80 см)', hint: 'Гном, Дет – не требуют подвязки' },
  { value: 'medium', label: 'Средние (80-130 см)', hint: 'Требуют лёгкой опоры' },
  { value: 'high', label: 'Высокие (нужна опора)', hint: 'Индет, нужна шпалера' },
];
const ripeningOptions = ['Раннеспелый', 'Среднеранний', 'Среднеспелый', 'Позднеспелый'];
const colorOptions = ['Red', 'Pink', 'Yellow', 'Orange', 'Black', 'Green', 'BiColor'];
const typeOptions = ['Cherry', 'Plum', 'Classic', 'Beefsteak', 'Heart'];

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
}) => {
  const isFiltered = !!(
    filters.search ||
    filters.environment ||
    filters.ripening ||
    filters.color ||
    filters.type ||
    filters.growth
  );

  const activeFilters = [
    filters.growth && { label: growthOptions.find(g => g.value === filters.growth)?.label || filters.growth, key: 'growth' },
    filters.ripening && { label: localize(filters.ripening), key: 'ripening' },
    filters.color && { label: localize(filters.color), key: 'color' },
    filters.type && { label: localize(filters.type), key: 'type' },
    filters.environment && { label: filters.environment === 'ground' ? '🌱 Для грядок' : '🏠 Для теплиц', key: 'environment' },
  ].filter(Boolean) as { label: string; key: string }[];

  return (
    <div className="space-y-6 bg-white p-5 rounded-xl shadow-sm border border-stone-200">
      {/* Переключатель грядка/теплица */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-stone-700">📌 Где будете выращивать?</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onFilterChange({ environment: filters.environment === 'ground' ? '' : 'ground' })}
            className={`flex-1 py-2 px-3 rounded-full border transition ${
              filters.environment === 'ground'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-stone-700 border-stone-300'
            }`}
          >
            🌱 Для грядок
          </button>
          <button
            onClick={() => onFilterChange({ environment: filters.environment === 'greenhouse' ? '' : 'greenhouse' })}
            className={`flex-1 py-2 px-3 rounded-full border transition ${
              filters.environment === 'greenhouse'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-stone-700 border-stone-300'
            }`}
          >
            🏠 Для теплиц
          </button>
        </div>
      </div>

      {/* Высота куста – радио-кнопки */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-stone-700">📏 Высота куста</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {growthOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ growth: filters.growth === opt.value ? '' : opt.value })}
              className={`px-4 py-2 rounded-full text-sm transition ${
                filters.growth === opt.value
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              title={opt.hint}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Срок созревания */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-stone-700">⏱️ Срок созревания</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ripeningOptions.map(r => (
            <button
              key={r}
              onClick={() => onFilterChange({ ripening: filters.ripening === r ? '' : r })}
              className={`px-4 py-2 rounded-full text-sm transition ${
                filters.ripening === r
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {localize(r)}
            </button>
          ))}
        </div>
      </div>

      {/* Цвет плода */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-stone-700">🎨 Цвет плода</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map(c => (
            <button
              key={c}
              onClick={() => onFilterChange({ color: filters.color === c ? '' : c })}
              className={`px-4 py-2 rounded-full text-sm transition ${
                filters.color === c
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {localize(c)}
            </button>
          ))}
        </div>
      </div>

      {/* Тип плода */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-stone-700">🍅 Форма / размер</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map(t => (
            <button
              key={t}
              onClick={() => onFilterChange({ type: filters.type === t ? '' : t })}
              className={`px-4 py-2 rounded-full text-sm transition ${
                filters.type === t
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {localize(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Активные фильтры */}
      {activeFilters.length > 0 && (
        <div className="border-t pt-4">
          <div className="text-sm text-stone-500 mb-2">Активные фильтры:</div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(af => (
              <span key={af.key} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-sm">
                {af.label}
                <button onClick={() => onFilterChange({ [af.key]: '' })} className="ml-1 text-emerald-600 hover:text-emerald-900">✕</button>
              </span>
            ))}
            <button onClick={onReset} className="text-rose-600 text-sm underline-offset-2 hover:underline">Сбросить все</button>
          </div>
        </div>
      )}

      {/* Счётчик */}
      <div className="pt-2 text-sm text-stone-500 border-t flex justify-between">
        <span>Всего сортов: {totalCount}</span>
        <span className="font-medium text-emerald-700">Найдено: {filteredCount}</span>
      </div>
    </div>
  );
};
