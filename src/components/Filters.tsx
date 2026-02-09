import React from 'react';
import { Search, X, Filter, BarChart2 } from 'lucide-react';
import { FilterState, TomatoColor, TomatoType, GrowingEnvironment } from '../types';
import { localize } from '../utils/localization';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
}

const GROWTH_OPTIONS_RU = ['Гном', 'Дет', 'Среднерослый', 'Индет'];

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount,
}) => {
  const isFiltered =
    filters.search ||
    filters.color ||
    filters.type ||
    filters.growth ||
    filters.environment;

  const setEnvironment = (value: GrowingEnvironment) => {
    onFilterChange({
      environment: filters.environment === value ? '' : value,
    });
  };

  return (
    <div className="space-y-5 bg-white p-4 rounded-xl shadow-sm border border-stone-100">
      {/* ENVIRONMENT — SEGMENTED CONTROL */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-stone-700">
          Где выращиваете томаты
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setEnvironment('ground')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition
              ${
                filters.environment === 'ground'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
              }`}
          >
            🌿 Открытый грунт
          </button>

          <button
            onClick={() => setEnvironment('greenhouse')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition
              ${
                filters.environment === 'greenhouse'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
              }`}
          >
            🏠 Теплица
          </button>

          <button
            onClick={() => setEnvironment('both')}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium border transition
              ${
                filters.environment === 'both'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
              }`}
          >
            🌤 Для обоих
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Поиск сорта (если знаете название)…"
          className="w-full border border-stone-200 rounded-lg pl-10 pr-4 py-2.5 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-stone-400 text-base"
        />
      </div>

      {/* SECONDARY FILTERS */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-stone-500 text-sm font-medium">
          <Filter size={16} /> Фильтры
        </div>

        <select
          value={filters.color}
          onChange={(e) => onFilterChange({ color: e.target.value })}
          className="border border-stone-200 rounded-lg px-3 py-2 bg-white text-sm text-stone-700 hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
        >
          <option value="">🎨 Цвет</option>
          {Object.values(TomatoColor).map((c) => (
            <option key={c} value={c}>
              {localize(c)}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ type: e.target.value })}
          className="border border-stone-200 rounded-lg px-3 py-2 bg-white text-sm text-stone-700 hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
        >
          <option value="">🍅 Тип плода</option>
          {Object.values(TomatoType).map((t) => (
            <option key={t} value={t}>
              {localize(t)}
            </option>
          ))}
        </select>

        <select
          value={filters.growth}
          onChange={(e) => onFilterChange({ growth: e.target.value })}
          className="border border-stone-200 rounded-lg px-3 py-2 bg-white text-sm text-stone-700 hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
        >
          <option value="">🌱 Тип куста</option>
          {GROWTH_OPTIONS_RU.map((g) => (
            <option key={g} value={g}>
              {g === 'Гном'
                ? 'Гном'
                : g === 'Дет'
                ? 'Низкорослый (Дет)'
                : g === 'Среднерослый'
                ? 'Среднерослый (Полудет)'
                : 'Высокорослый (Индет)'}
            </option>
          ))}
        </select>

        {isFiltered && (
          <button
            onClick={onReset}
            className="text-sm text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-lg flex items-center gap-1 transition-colors self-start"
          >
            <X size={14} /> Сбросить
          </button>
        )}
      </div>

      {/* COUNTER */}
      <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 px-4 py-2 rounded-full">
        <BarChart2 size={14} className="text-emerald-500" />
        <span className="text-sm font-medium text-stone-600">
          {isFiltered ? (
            <>
              Найдено{' '}
              <span className="text-emerald-600 font-bold">{filteredCount}</span> из{' '}
              {totalCount}
            </>
          ) : (
            <>
              Всего сортов{' '}
              <span className="text-stone-800 font-bold">{totalCount}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
};
