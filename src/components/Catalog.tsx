import { localize } from '../utils/localization';
{/* Цвет — динамический, но с русским отображением */}
<select
  value={filters.color}
  onChange={(e) => setFilters({ ...filters, color: e.target.value })}
  className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
>
  <option value="">🎨 Все цвета ({uniqueColors.length})</option>
  {uniqueColors.map(color => (
    <option key={color} value={color}>{localize(color)}</option>
  ))}
</select>

{/* Тип плода — динамический, с русским отображением */}
<select
  value={filters.type}
  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
  className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
>
  <option value="">🍅 Все типы ({uniqueTypes.length})</option>
  {uniqueTypes.map(type => (
    <option key={type} value={type}>{localize(type)}</option>
  ))}
</select>

{/* Тип куста — русские названия уже, но добавим localize на всякий */}
<select
  value={filters.growth}
  onChange={(e) => setFilters({ ...filters, growth: e.target.value })}
  className="border border-stone-200 rounded-lg px-3 py-2 text-sm"
>
  <option value="">🌱 Все кусты ({uniqueGrowth.length})</option>
  {uniqueGrowth.map(growth => (
    <option key={growth} value={growth}>{localize(growth)}</option>
  ))}
</select>
