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

// Расшифровка значений для подсказок
const growthHints: Record<string, string> = {
  'Гном': '🌱 30-60 см, не требует подвязки',
  'Дет': '🌿 60-100 см, лёгкая опора',
  'Среднерослый': '🌳 100-150 см, нужна подвязка',
  'Индет': '🌲 150-250 см, обязательна шпалера и пасынкование'
};

const ripeningHints: Record<string, string> = {
  'Раннеспелый': '⏱️ 85-100 дней – успеет даже в Сибири',
  'Среднеранний': '⏱️ 100-110 дней',
  'Среднеспелый': '⏱️ 110-120 дней',
  'Позднеспелый': '⏱️ более 120 дней – осторожно в холодных регионах'
};

const environmentLabels = {
  ground: '🌱 Для грядок (открытый грунт)',
  greenhouse: '🏠 Для теплиц'
};

// Быстрые сценарии (пресеты)
const quickScenarios = [
  { label: '🍅 Новичкам простые', filter: { growth: 'Дет', ripening: 'Раннеспелый', color: '', type: '' } },
  { label: '🌟 Сердцевидные', filter: { type: 'Heart', growth: '', ripening: '', color: '' } },
  { label: '🌞 Биколоры', filter: { color: 'BiColor', growth: '', ripening: '', type: '' } },
  { label: '🍒 Черри для салатов', filter: { type: 'Cherry', growth: '', ripening: '', color: '' } }
];

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalCount,
  filteredCount
}) => {
  const growthOptions = ['Гном', 'Дет', 'Среднерослый', 'Индет'];
  const ripeningOptions = ['Раннеспелый', 'Среднеранний', 'Среднеспелый', 'Позднеспелый'];
  const colorOptions = ['Red', 'Pink', 'Yellow', 'Orange', 'Black', 'Green', 'BiColor'];
  const typeOptions = ['Cherry', 'Plum', 'Classic', 'Beefsteak', 'Heart'];

  const isFiltered = !!(
    filters.search ||
    filters.environment ||
    filters.ripening ||
    filters.color ||
    filters.type ||
    filters.growth
  );

  // Активные фильтры (для отображения)
  const activeFilters = [
    filters.growth && { label: `Рост: ${localize(filters.growth)}`, key: 'growth' },
    filters.ripening && { label: `Созревание: ${localize(filters.ripening)}`, key: 'ripening' },
    filters.color && { label: `Цвет: ${localize(filters.color)}`, key: 'color' },
    filters.type && { label: `Тип: ${localize(filters.type)}`, key: 'type' },
    filters.environment && { label: environmentLabels[filters.environment as 'ground'|'greenhouse'], key: 'environment' }
  ].filter(Boolean) as { label: string; key: string }[];

  const handleEnvironmentChange = (env: 'ground' | 'greenhouse') => {
    onFilterChange({ environment: filters.environment === env ? '' : env });
  };

  const applyQuickScenario = (scenario: typeof quickScenarios[0]) => {
    onFilterChange(scenario.filter);
  };

  return (
    <div className="space-y-6 bg-white p-5 rounded-xl shadow-sm border border-stone-200">
      {/* Переключатель грядка/теплица */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-stone-700">📌 Где будете выращивать?</span>
          <span className="text-xs text-stone-400 cursor-help" title="Для грядок рекомендуются низкорослые и ранние сорта. В теплице можно выращивать любые.">ⓘ</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleEnvironmentChange('ground')}
            className={`flex-1 py-2 px-3 rounded-full border transition ${
              filters.environment === 'ground'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            🌱 Для грядок
          </button>
          <button
            onClick={() => handleEnvironmentChange('greenhouse')}
            className={`flex-1 py-2 px-3 rounded-full border transition ${
              filters.environment === 'greenhouse'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
          >
            🏠 Для теплиц
          </button>
        </div>
        {filters.environment === 'ground' && (
          <div className="text-xs text-emerald-700 mt-2 bg-emerald-50 p-2 rounded-lg">
            💡 Совет: Для открытого грунта лучше выбирать низкорослые (Гном, Дет) и ранние сорта. Поздние и высокорослые (Индет) могут не успеть вызреть.
          </div>
        )}
        {filters.environment === 'greenhouse' && (
          <div className="text-xs text-emerald-700 mt-2 bg-emerald-50 p-2 rounded-lg">
            🔥 В теплице можно вырастить даже самые поздние и высокорослые сорта. Обратите внимание на Бифштексы и ампельные формы.
          </div>
        )}
      </div>

      {/* Тип куста (высота) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-stone-700">📏 Высота куста</span>
          <span className="text-xs text-stone-400 cursor-help" title="Низкие – для грядок и балконов, высоким нужна опора">ⓘ</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {growthOptions.map(g => (
            <button
              key={g}
              onClick={() => onFilterChange({ growth: filters.growth === g ? '' : g })}
              className={`px-4 py-2 rounded-full text-sm transition ${
                filters.growth === g
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              title={growthHints[g]}
            >
              {localize(g)}
            </button>
          ))}
        </div>
      </div>

      {/* Срок созревания */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-stone-700">⏱️ Срок созревания</span>
          <span className="text-xs text-stone-400 cursor-help" title="Ранние меньше 100 дней, поздние – больше 120">ⓘ</span>
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
              title={ripeningHints[r]}
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
          <span className="text-xs text-stone-400 cursor-help" title="Красные – самые привычные, жёлтые – менее кислые, чёрные – с пряным вкусом">ⓘ</span>
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

      {/* Тип плода (форма) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-stone-700">🍅 Форма / размер</span>
          <span className="text-xs text-stone-400 cursor-help" title="Черри – маленькие, сливки – для засолки, бифштексы – мясистые для бургеров">ⓘ</span>
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
        <div className="border-t pt-4 mt-2">
          <div className="text-sm text-stone-500 mb-2">Активные фильтры:</div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(af => (
              <span key={af.key} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-sm">
                {af.label}
                <button
                  onClick={() => onFilterChange({ [af.key]: '' })}
                  className="ml-1 text-emerald-600 hover:text-emerald-900"
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              onClick={onReset}
              className="text-rose-600 text-sm underline-offset-2 hover:underline"
            >
              Сбросить все
            </button>
          </div>
        </div>
      )}

      {/* Быстрые сценарии */}
      <div className="border-t pt-4 mt-2">
        <div className="text-sm text-stone-500 mb-2">🚀 Быстрые сценарии:</div>
        <div className="flex flex-wrap gap-2">
          {quickScenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => applyQuickScenario(sc)}
              className="bg-white border border-stone-300 text-stone-700 px-4 py-1.5 rounded-full text-sm hover:bg-stone-50 transition"
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Счётчик */}
      <div className="pt-2 text-sm text-stone-500 border-t flex justify-between">
        <span>Всего сортов: {totalCount}</span>
        <span className="font-medium text-emerald-700">Найдено: {filteredCount}</span>
      </div>
    </div>
  );
};
