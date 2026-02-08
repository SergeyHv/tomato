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

const GROWTH_OPTIONS_RU = [
  'Гном',
  'Дет',
  'Среднерослый',
  'Индет',
];

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
    <div className="space-y-6 bg-white p-4 rounded-xl shadow-sm border border-stone-100">
      {/* ENVIRONMENT */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-stone-800">
          Где вы планируете выращивать томаты?
        </h3>
        <p className="text-sm text-stone-500">
          Это поможет сразу показать подходящие сорта
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => setEnvironment('ground')}
            className={`rounded-xl border px-4 py-4 text-left transition-all
              ${filters.environment === 'ground'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-stone-200 hover:border-emerald-300'}
            `}
          >
            <div className="text-lg font-medium">🌿 Открытый грунт</div>
            <div className="text-sm text-stone-500">Для грядок и дачи</div>
          </button>

          <button
            onClick={() => setEnvironment('greenhouse')}
            className={`rounded-xl border px-4 py-4 text-left transition-all
              ${filters.environment === 'greenhouse'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-stone-200 hover:border-emerald-300'}
            `}
          >
            <div className="text-lg font-medium">🏠 Теплица</div>
            <div className="text-sm text-stone-500">Для выращивания в теплице</div>
          </button>

          <button
            onClick={() => setEnvironment('both')}
            className={`rounded-xl border px-4 py-4 text-left transition-all
              ${filters.environment === 'both'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-stone-200 hover:border-emerald-300'}
            `}
          >
            <div className="text-lg font-medium">🌤 Подходит для обоих</div>
            <div className="text-sm text-stone-500">Универсальные сорта</div>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-stone-500 text-sm font-medium mr-1">
            <Filter size={16} /> Фильтры:
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

          {/* TYPE OF GROWTH — RU VALUES ONLY */}
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
              className="text-sm text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <X size={14} /> Сбросить
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 px-4 py-2 rounded-full self-start md:self-auto">
          <BarChart2 size={14} className="text-emerald-500" />
          <span className="text-sm font-medium text-stone-600">
            {isFiltered ? (
              <>
                Найдено:{' '}
                <span className="text-emerald-600 font-bold">{filteredCount}</span> из {totalCount}
              </>
            ) : (
              <>
                Всего сортов:{' '}
                <span className="text-stone-800 font-bold">{totalCount}</span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
