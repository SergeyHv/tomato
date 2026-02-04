
import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileDown, ArrowRight, ArrowLeft, FileText, Camera, Loader2, Play, RefreshCw, AlertTriangle } from 'lucide-react';
import { TomatoColor, TomatoType } from '../types';
import { localize } from '../utils/localization';
import { GoogleGenAI } from "@google/genai";

interface TaggedItem {
    filename: string;
    name: string;
    origin: string;
    growth: string;
    type: string;
    color: string;
    weight: string;
    description: string;
}

// --- OCR ЛОГИКА ВНУТРИ КОМПОНЕНТА С RETRY И FALLBACK ---
const processOCRBatch = async (batchTexts: string[], onRetryStatus?: (msg: string) => void) => {
    // В Vite process.env.API_KEY заменяется на строку на этапе сборки
    // @ts-ignore
    const API_KEY = process.env.API_KEY;
    
    if (!API_KEY) {
        throw new Error("API Key не найден. Проверьте .env файл или конфигурацию Vercel/Netlify.");
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
    I have a list of raw OCR text snippets describing tomato varieties.
    
    STRUCTURE RULES:
    1. The FIRST LINE of each snippet is the "SourceID" (Filename or Tag). Preserve it exactly.
    2. The REST of the text describes the tomato.
    
    TASK:
    Extract structured data.
    
    STRICT ENUM VALUES (Use these exact English values):
    - growth: "Indeterminate" (high, 1.8m+), "Determinate" (low, bush), "Dwarf" (gnome, stout), "Semi-determinate".
    - type: "Cherry" (small), "Plum" (oval, elongated), "Heart" (heart-shaped), "Beefsteak" (large, flat-round), "Classic" (round).
    - color: "Red", "Pink", "Yellow", "Orange", "Black" (purple, chocolate, dark), "Green", "Bi-color" (striped, two-colored), "White".

    Input snippets:
    ${JSON.stringify(batchTexts)}

    Return a JSON ARRAY of objects:
    {
        "source_id": "String (First line of input)",
        "name": "Variety Name (Russian)",
        "origin": "Country/Breeder",
        "growth": "Enum Value",
        "type": "Enum Value",
        "color": "Enum Value",
        "weight": "String (e.g. '200-300 г')",
        "description": "Clean Russian description (2-3 sentences max)."
    }
    `;

    // Порядок моделей: Стабильная -> Экспериментальная
    const MODELS_TO_TRY = ['gemini-2.0-flash', 'gemini-2.0-flash-exp'];

    for (const modelName of MODELS_TO_TRY) {
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: { parts: [{ text: prompt }] },
                    config: { responseMimeType: "application/json" }
                });

                let jsonText = response.text || "[]";
                jsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
                return JSON.parse(jsonText);

            } catch (e: any) {
                const msg = e.message || "";
                
                // 1. ОШИБКА 404 - Модель не найдена (например, стабильная еще не раскатана на аккаунт)
                if (msg.includes('404') || msg.includes('not found')) {
                     // Ломаем while, чтобы внешний цикл for перешел к следующей модели
                     break; 
                }

                // 2. ОШИБКА 429 - Лимиты
                if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                    attempts++;
                    let waitTime = 20000; 
                    const match = msg.match(/retry in ([\d\.]+)s/);
                    
                    if (match && match[1]) {
                        waitTime = Math.ceil(parseFloat(match[1]) * 1000) + 1000;
                    } else {
                        waitTime = 10000 * attempts;
                    }
                    
                    if (onRetryStatus) {
                        onRetryStatus(`⏳ Лимит (${modelName}). Ждем ${(waitTime/1000).toFixed(0)}с...`);
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue; // Пробуем ту же модель снова
                } 
                
                // Другая ошибка - пропускаем модель
                console.error(`Error with model ${modelName}`, e);
                break;
            }
        }
    }
    
    return [];
};

export const AdminScanner: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [mode, setMode] = useState<'manual' | 'ocr'>('manual');
    
    // --- MANUAL STATE ---
    const [files, setFiles] = useState<File[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [taggedData, setTaggedData] = useState<Record<string, TaggedItem>>({});
    const [manualFormData, setManualFormData] = useState<TaggedItem>({
        filename: '', name: '', origin: '', growth: '', type: '', color: '', weight: '', description: ''
    });
    const nameInputRef = useRef<HTMLInputElement>(null);

    // --- OCR STATE ---
    const [ocrText, setOcrText] = useState("");
    const [ocrResults, setOcrResults] = useState<any[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [parseProgress, setParseProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // === MANUAL LOGIC ===
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            if (files.length === 0 && newFiles.length > 0) setCurrentIndex(0);
        }
    };

    useEffect(() => {
        if (files.length > 0 && files[currentIndex]) {
            const file = files[currentIndex];
            const saved = taggedData[file.name];
            if (saved) {
                setManualFormData(saved);
            } else {
                const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                setManualFormData({
                    filename: file.name, name: rawName, origin: '', growth: '', type: '', color: '', weight: '', description: ''
                });
            }
            setTimeout(() => nameInputRef.current?.focus(), 50);
        }
    }, [currentIndex, files]);

    const handleManualChange = (field: keyof TaggedItem, value: string) => {
        setManualFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveAndNext = () => {
        if (!files[currentIndex]) return;
        setTaggedData(prev => ({ ...prev, [files[currentIndex].name]: manualFormData }));
        if (currentIndex < files.length - 1) setCurrentIndex(prev => prev + 1);
        else alert("Все фото пройдены!");
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    const downloadManualCSV = () => {
        const headers = ["image_url", "Name", "origin", "growth_type", "fruit_type", "color", "weight_g", "description"];
        const rows = Object.values(taggedData).map(item => {
            const safe = (str: string) => `"${String(str || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`;
            return [
                safe(item.filename), safe(item.name), safe(item.origin), safe(item.growth),
                safe(item.type), safe(item.color), safe(item.weight), safe(item.description)
            ].join(",");
        });
        downloadCSVFile(headers, rows, "manual_tags");
    };

    // === OCR LOGIC ===
    const handleStartOCR = async () => {
        if (!ocrText.trim()) return;
        setIsParsing(true);
        setErrorMsg(null);
        setStatusMsg("");
        setOcrResults([]);
        setParseProgress(0);

        try {
            const rawChunks = ocrText
                .split(/Image Result:/gi)
                .map(s => s.trim())
                .filter(s => s.length > 5);

            if (rawChunks.length === 0) {
                throw new Error("Не найдено блоков текста. Убедитесь, что текст содержит 'Image Result:'.");
            }

            const BATCH_SIZE = 3; // Осторожный размер батча
            let allResults: any[] = [];

            for (let i = 0; i < rawChunks.length; i += BATCH_SIZE) {
                const batch = rawChunks.slice(i, i + BATCH_SIZE);
                setStatusMsg(`Обработка ${i + 1} - ${Math.min(i + batch.length, rawChunks.length)}...`);
                
                // Вызываем функцию с callback для статуса ретраев
                const results = await processOCRBatch(batch, (retryMsg) => setStatusMsg(retryMsg));
                
                allResults = [...allResults, ...results];
                setOcrResults(prev => [...prev, ...results]);
                setParseProgress(Math.round(((i + batch.length) / rawChunks.length) * 100));
                
                // Пауза для API
                await new Promise(r => setTimeout(r, 1000));
            }
            setStatusMsg("Готово!");
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "Произошла ошибка при обработке.");
        } finally {
            setIsParsing(false);
        }
    };

    const downloadOcrCSV = () => {
        const headers = ["image_url", "Name", "origin", "growth_type", "fruit_type", "color", "weight_g", "description"];
        const rows = ocrResults.map(item => {
            const safe = (str: string) => `"${String(str || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`;
            return [
                safe(item.source_id), safe(item.name), safe(item.origin), safe(item.growth),
                safe(item.type), safe(item.color), safe(item.weight), safe(item.description)
            ].join(",");
        });
        downloadCSVFile(headers, rows, "ocr_parsed");
    };

    // --- UTILS ---
    const downloadCSVFile = (headers: string[], rows: string[], prefix: string) => {
        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${prefix}_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    // --- RENDER ---
    return (
        <div className="bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col h-[85vh]">
            {/* Хедер */}
            <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex bg-stone-200 rounded-lg p-1 gap-1">
                        <button 
                            onClick={() => setMode('manual')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition ${mode === 'manual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            <Camera size={16} /> Фото-сканер
                        </button>
                        <button 
                            onClick={() => setMode('ocr')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold flex items-center gap-2 transition ${mode === 'ocr' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                        >
                            <FileText size={16} /> Импорт текста
                        </button>
                    </div>
                </div>
                
                <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-800 px-3 py-1 rounded-md hover:bg-stone-200 transition">
                    Закрыть
                </button>
            </div>

            {mode === 'manual' ? (
                // === MANUAL UI ===
                files.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-stone-50">
                        <label className="cursor-pointer group flex flex-col items-center">
                            <div className="w-20 h-20 bg-white rounded-full shadow-sm border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400 group-hover:border-emerald-500 group-hover:text-emerald-500 transition mb-4">
                                <Upload size={32} />
                            </div>
                            <span className="font-bold text-lg text-stone-700">Выберите фото томатов</span>
                            <span className="text-stone-400 text-sm mt-1">Можно сразу много</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                        </label>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                        {/* ЛЕВАЯ КОЛОНКА */}
                        <div className="w-full lg:w-1/2 bg-stone-900 flex items-center justify-center relative p-4 group">
                            {files[currentIndex] && (
                                <img src={URL.createObjectURL(files[currentIndex])} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl" />
                            )}
                            <button 
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition disabled:opacity-0"
                            >
                                <ArrowLeft size={24} />
                            </button>
                        </div>
                        {/* ПРАВАЯ КОЛОНКА */}
                        <div className="w-full lg:w-1/2 bg-white flex flex-col border-l border-stone-200">
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Название</label>
                                    <input 
                                        ref={nameInputRef}
                                        type="text" 
                                        value={manualFormData.name}
                                        onChange={e => handleManualChange('name', e.target.value)}
                                        className="w-full text-xl font-bold border-b-2 border-stone-200 focus:border-emerald-500 outline-none py-2 bg-transparent"
                                        placeholder="Введите название..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Цвет</label>
                                        <select 
                                            value={manualFormData.color}
                                            onChange={e => handleManualChange('color', e.target.value)}
                                            className="w-full border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 outline-none"
                                        >
                                            <option value="">Не выбрано</option>
                                            {Object.values(TomatoColor).map(c => <option key={c} value={c}>{localize(c)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Тип</label>
                                        <select 
                                            value={manualFormData.type}
                                            onChange={e => handleManualChange('type', e.target.value)}
                                            className="w-full border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 outline-none"
                                        >
                                            <option value="">Не выбрано</option>
                                            {Object.values(TomatoType).map(t => <option key={t} value={t}>{localize(t)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Описание</label>
                                    <textarea 
                                        value={manualFormData.description}
                                        onChange={e => handleManualChange('description', e.target.value)}
                                        rows={3}
                                        className="w-full border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 outline-none resize-none"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-between gap-3">
                                <button onClick={downloadManualCSV} disabled={Object.keys(taggedData).length === 0} className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 font-bold hover:bg-white flex items-center gap-2">
                                    <FileDown size={18} /> CSV
                                </button>
                                <button onClick={handleSaveAndNext} className="flex-1 bg-stone-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-stone-900 flex items-center justify-center gap-2">
                                    Сохранить и Далее <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            ) : (
                // === OCR UI ===
                <div className="flex h-full overflow-hidden">
                    <div className="w-1/3 border-r border-stone-200 flex flex-col bg-stone-50 p-4">
                        <label className="block text-sm font-bold text-stone-700 mb-2">Вставьте текст (Raw OCR Data)</label>
                        <textarea 
                            value={ocrText}
                            onChange={(e) => setOcrText(e.target.value)}
                            placeholder={`Пример:\nImage Result:\njr/34 ф5 6/6\nПольская селекция...\n\nImage Result:\nNN 3529...`}
                            className="flex-1 w-full border border-stone-300 rounded-xl p-3 text-xs font-mono resize-none focus:ring-2 focus:ring-emerald-500 outline-none mb-4"
                        />
                        
                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <div>{errorMsg}</div>
                            </div>
                        )}

                        <button 
                            onClick={handleStartOCR}
                            disabled={isParsing || !ocrText}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isParsing ? <><Loader2 className="animate-spin"/> {statusMsg || `Обработка ${parseProgress}%`}</> : <><Play size={18} /> Распознать через Gemini</>}
                        </button>
                    </div>
                    
                    <div className="w-2/3 flex flex-col bg-white">
                         <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <h3 className="font-bold text-stone-700 flex items-center gap-2">
                                Результаты <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">{ocrResults.length}</span>
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={() => setOcrResults([])} className="text-stone-400 hover:text-stone-600 p-2"><RefreshCw size={16}/></button>
                                <button 
                                    onClick={downloadOcrCSV}
                                    disabled={ocrResults.length === 0}
                                    className="bg-stone-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-stone-900 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <FileDown size={16} /> Скачать CSV
                                </button>
                            </div>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-0">
                            {ocrResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-stone-400">
                                    <FileText size={48} className="mb-2 opacity-20" />
                                    <p>Здесь появятся результаты парсинга</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 sticky top-0">
                                        <tr>
                                            <th className="p-3 w-1/4">ID (Файл)</th>
                                            <th className="p-3 w-1/4">Название</th>
                                            <th className="p-3">Характеристики</th>
                                            <th className="p-3 w-1/3">Описание</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {ocrResults.map((item, i) => (
                                            <tr key={i} className="hover:bg-stone-50">
                                                <td className="p-3 font-mono text-xs text-stone-500 truncate max-w-[150px]" title={item.source_id}>{item.source_id}</td>
                                                <td className="p-3 font-bold text-stone-800">{item.name}</td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        <span className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] uppercase text-stone-600 border border-stone-200">{localize(item.color)}</span>
                                                        <span className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] uppercase text-stone-600 border border-stone-200">{localize(item.growth)}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-stone-600 text-xs line-clamp-2" title={item.description}>{item.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};
