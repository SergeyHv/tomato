
import { Tomato, CartItem } from '../types';
import { TOMATO_DATA } from '../constants';
import { normalizeCategory } from '../utils/localization';

const getEnv = (key: string): string | undefined => {
  try {
    // @ts-ignore
    const env = import.meta.env;
    return env ? env[key] : undefined;
  } catch (e) {
    return undefined;
  }
};

const AIRTABLE_BASE_ID = getEnv("VITE_AIRTABLE_BASE_ID") || "app6EHiUQjTfVJlms";
const AIRTABLE_TABLE = "Varieties";
const AIRTABLE_ORDERS_TABLE = "Orders";
const AIRTABLE_TOKEN = getEnv("VITE_AIRTABLE_TOKEN") || "";

/**
 * Вспомогательная функция для безопасного получения полей из Airtable
 * учитывает разные варианты написания имен колонок
 */
const getField = (fields: Record<string, any>, ...keys: string[]): any => {
    for (const key of keys) {
        if (fields[key] !== undefined) return fields[key];
    }
    const fieldKeys = Object.keys(fields);
    for (const key of keys) {
        const found = fieldKeys.find(k => k.toLowerCase() === key.toLowerCase());
        if (found) return fields[found];
    }
    return undefined;
};

export const fetchTomatoes = async (): Promise<Tomato[]> => {
  if (!AIRTABLE_TOKEN || AIRTABLE_TOKEN.includes('......')) {
    console.warn("Airtable token not found, using mock data.");
    return TOMATO_DATA;
  }

  try {
    let allRecords: any[] = [];
    let offset = "";
    
    do {
      const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`);
      if (offset) url.searchParams.append("offset", offset);

      const res = await fetch(url.toString(), { 
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` } 
      });
      
      if (!res.ok) throw new Error(`Airtable error: ${res.status}`);

      const data = await res.json();
      allRecords = [...allRecords, ...data.records];
      offset = data.offset;
    } while (offset);

    return allRecords
      .filter((r: any) => {
          const name = getField(r.fields, 'Name', 'name');
          const isVisible = getField(r.fields, 'Visible', 'visible', 'Published');
          return !!name && (isVisible === true || isVisible === undefined);
      })
      .map((r: any): Tomato => {
        const f = r.fields;

        let imageUrl = ""; 
        const photoField = getField(f, 'Photo', 'photo', 'Attachments');
        const filename = getField(f, 'image_url', 'ImageFilename');
        
        if (photoField && Array.isArray(photoField) && photoField.length > 0) {
            imageUrl = photoField[0].url;
        } 
        else if (filename) {
            const nameStr = String(filename).trim();
            imageUrl = nameStr.startsWith('http') ? nameStr : `/tomatoes/${nameStr}`;
        }

        const name = getField(f, 'Name', 'name') || "Без имени";
        const desc = getField(f, 'description', 'Description') || "";
        const colorRaw = getField(f, 'color', 'Color') || "Разное";
        const typeRaw = getField(f, 'fruit_type', 'Type') || "Классика";
        const growthRaw = getField(f, 'growth_type', 'Growth') || "Индет";
        const weight = getField(f, 'weight', 'Weight') || "Не указано";
        const origin = getField(f, 'origin', 'Origin') || "";

        return {
            id: r.id,
            name: name, 
            originalName: "", 
            description: desc,
            fullDescription: desc, 
            color: normalizeCategory(String(colorRaw)),
            type: normalizeCategory(String(typeRaw)),
            growth: normalizeCategory(String(growthRaw)),
            height: "Не указано",
            weight: String(weight),
            imageUrl: imageUrl,
            price: 0,
            origin: String(origin)
        };
      });
  } catch (err) {
    console.error("Fetch error:", err);
    return TOMATO_DATA;
  }
};

export const submitOrder = async (order: {
    name: string;
    phone: string;
    address: string;
    comment: string;
    items: CartItem[];
}): Promise<void> => {
  if (!AIRTABLE_TOKEN || AIRTABLE_TOKEN.includes('......')) return;

  const itemsList = order.items.map((i) => i.tomato.name).join(', ');
  const payload = {
    fields: {
      "Phone": order.phone,
      "Addres": order.address, 
      "VarietiesList": itemsList,
      "CustomerComment": `${order.name}. ${order.comment}`
    }
  };

  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_ORDERS_TABLE)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Order failed");
};
