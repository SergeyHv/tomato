import React, { useState } from 'react';
import {
  X, Trash2, Package, Send, Loader2, CheckCircle, Copy, Printer, Share2
} from 'lucide-react';
import { CartItem } from '../types';
import { submitOrder } from '../services/api';

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ cart, onClose, onRemove, onClear }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedItems, setSubmittedItems] = useState<CartItem[]>([]);
  const [submittedForm, setSubmittedForm] = useState(formData);
  const [step, setStep] = useState(1); // 1 - контакты, 2 - отправка, 3 - отправлено

  // Текст для текущего списка (на основе cart и formData)
  const getCurrentListText = () => {
    const headerParts: string[] = ['🛒 Мой заказ томатов'];
    if (formData.name) headerParts.push(`👤 Имя: ${formData.name}`);
    if (formData.phone) headerParts.push(`📞 Телефон: ${formData.phone}`);
    if (formData.address) headerParts.push(`📍 Адрес: ${formData.address}`);
    if (formData.comment) headerParts.push(`📝 Комментарий: ${formData.comment}`);

    const header = headerParts.join('\n');
    const itemsLines = cart.map((item, i) => `${i + 1}. ${item.tomato.name} — ${item.quantity} шт.`).join('\n');
    const total = cart.reduce((s, i) => s + i.quantity, 0);
    return `${header}\n\n📦 Состав:\n${itemsLines}\n\n📊 Всего сортов: ${total}`;
  };

  // Текст для экрана успеха (отправленный список)
  const getSuccessListText = () => {
    const header = `🛒 Мой заказ томатов\n\n👤 Имя: ${submittedForm.name}\n📞 Телефон: ${submittedForm.phone}\n📍 Адрес: ${submittedForm.address}\n📝 Комментарий: ${submittedForm.comment || 'нет'}\n\n📦 Состав:\n`;
    const items = submittedItems.map((item, i) => `${i + 1}. ${item.tomato.name} — ${item.quantity} шт.`).join('\n');
    const total = submittedItems.reduce((s, i) => s + i.quantity, 0);
    return header + items + `\n\n📊 Всего сортов: ${total}`;
  };

  // Проверка, мобильное ли устройство (имеет тач-события)
  const isMobile = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  const handleShare = async () => {
    const text = getCurrentListText();
    // На мобильных используем нативный шаринг, на десктопах сразу копируем
    if (navigator.share && isMobile()) {
      try {
        await navigator.share({ title: 'Мой заказ томатов', text });
        return; // успешно поделились
      } catch {
        // пользователь отменил или ошибка – fallback на копирование
      }
    }
    // Fallback: копирование в буфер
    try {
      await navigator.clipboard.writeText(text);
      alert('✅ Список скопирован в буфер обмена');
    } catch {
      alert('❌ Не удалось скопировать. Попробуйте выделить текст вручную.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setStep(2);

    try {
      await submitOrder(cart, formData);
      setSubmittedItems([...cart]);
      setSubmittedForm({ ...formData });
      setIsSuccess(true);
      setStep(3);
      onClear();
    } catch (error) {
      console.error(error);
      setSubmitError("❌ Не удалось отправить заказ. Попробуйте позже или напишите нам напрямую.");
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySuccess = async () => {
    try {
      await navigator.clipboard.writeText(getSuccessListText());
      alert('✅ Список скопирован в буфер обмена');
    } catch {
      alert('❌ Не удалось скопировать. Попробуйте выделить текст вручную.');
    }
  };

  const handlePrintSuccess = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('❌ Не удалось открыть окно печати. Разрешите всплывающие окна.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Мой заказ томатов</title>
          <style>
            body { font-family: sans-serif; padding: 20px; line-height: 1.5; }
            pre { white-space: pre-wrap; font-size: 14px; }
            h2 { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h2>Мой заказ томатов</h2>
          <pre>${getSuccessListText()}</pre>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const steps = [
    { num: 1, label: 'Контакты' },
    { num: 2, label: isSubmitting ? 'Отправка...' : 'Подтверждение' },
    { num: 3, label: 'Отправлено' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Хедер */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Package className="text-emerald-600" /> Ваш список
          </h2>
          <div className="flex items-center gap-1">
            {cart.length > 0 && !isSuccess && (
              <button
                onClick={handleShare}
                className="text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-full transition-colors"
                title="Поделиться списком"
              >
                <Share2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 p-2 rounded-full transition-colors"
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Прогресс-бар (только когда не экран успеха) */}
        {!isSuccess && cart.length > 0 && (
          <div className="px-5 pt-4">
            <div className="flex items-center justify-between mb-2">
              {steps.map((s) => (
                <div key={s.num} className="flex flex-col items-center w-full">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                      step >= s.num
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-stone-300 text-stone-400'
                    }`}
                  >
                    {step > s.num ? <CheckCircle size={16} /> : s.num}
                  </div>
                  <span className={`text-xs mt-1 ${step >= s.num ? 'text-emerald-700 font-medium' : 'text-stone-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center px-4 mb-2">
              <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-stone-200'}`} />
              <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-stone-200'}`} />
            </div>
          </div>
        )}

        {/* Контент */}
        <div className="flex-1 overflow-y-auto p-5 bg-stone-50/30">
          {isSuccess ? (
            <div className="text-center">
              <CheckCircle className="mx-auto text-emerald-500 mb-2" size={48} />
              <h2 className="text-xl font-bold text-stone-800">Заказ отправлен!</h2>
              <p className="text-stone-600 mt-1">Мы получили ваш список. Ниже его копия для вас.</p>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 my-4 text-left">
                <h3 className="font-semibold text-stone-700 mb-2">📦 Ваш список:</h3>
                <ul className="list-disc list-inside text-sm text-stone-800 space-y-1">
                  {submittedItems.map((item, index) => (
                    <li key={item.tomato.id}>
                      <span className="font-medium">{item.tomato.name}</span> — {item.quantity} шт.
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-sm text-stone-600">
                  👤 {submittedForm.name} | 📞 {submittedForm.phone}
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleCopySuccess}
                  className="flex-1 flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 px-3 rounded-lg text-sm font-medium transition"
                >
                  <Copy size={16} /> Скопировать
                </button>
                <button
                  onClick={handlePrintSuccess}
                  className="flex-1 flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 px-3 rounded-lg text-sm font-medium transition"
                >
                  <Printer size={16} /> Распечатать
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                Закрыть
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <p>Список пуст.</p>
              <p className="text-sm mt-1">Добавьте сорта из каталога.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item, index) => (
                <li key={item.tomato.id} className="bg-white p-3 rounded-xl border border-stone-100 shadow-sm flex items-center gap-4">
                  <span className="text-emerald-600 font-bold text-sm w-4">{index + 1}</span>
                  <img src={item.tomato.imageUrl} alt={item.tomato.name} className="w-12 h-12 rounded-lg object-cover bg-stone-200" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-stone-800 text-sm">{item.tomato.name}</h4>
                  </div>
                  <button onClick={() => onRemove(item.tomato.id)} className="text-stone-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-50 transition">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Форма заказа */}
        {cart.length > 0 && !isSuccess && (
          <div className="p-5 border-t border-stone-100 bg-white rounded-b-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-stone-500 font-medium">Всего сортов:</span>
              <span className="text-2xl font-bold text-stone-800">{cart.length}</span>
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Имя" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="Телефон" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" placeholder="Адрес доставки (СДЭК/Почта)" className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              <textarea value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} placeholder="Комментарий к заказу..." className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClear} disabled={cart.length === 0 || isSubmitting} className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 hover:text-rose-600 transition disabled:opacity-50">Очистить</button>
                <button type="submit" disabled={cart.length === 0 || isSubmitting} className="flex-[2] bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:shadow-xl transition disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Отправка...</> : <><Send size={18} /> Оформить заказ</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
