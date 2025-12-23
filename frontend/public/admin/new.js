// 1. Сразу при загрузке страницы пытаемся достать пароль из памяти браузера
document.addEventListener('DOMContentLoaded', () => {
    const savedPass = localStorage.getItem('tomato_admin_pass');
    if (savedPass) {
        const passInput = document.getElementById('adminPassword');
        if (passInput) passInput.value = savedPass;
    }
});

const form = document.getElementById('productForm');
const imageUpload = document.getElementById('imageUpload');
const preview = document.getElementById('preview');

// Превью фото
imageUpload.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            preview.innerHTML = `<img src="${e.target.result}" class="max-h-48 rounded shadow-lg" alt="preview">`;
        };
        reader.readAsDataURL(file);
    }
});

form.addEventListener('submit', async e => {
    e.preventDefault();
    
    // 1. Берем пароль и СРАЗУ сохраняем его в память
    const password = document.getElementById('adminPassword').value; // Оставляем CONST тут
    localStorage.setItem('tomato_admin_pass', password); 

    const submitBtn = e.target.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Загрузка...';

    try {
        let imageUrl = '';
        const file = imageUpload.files[0];

        // Загрузка фото
        if (file) {
            // Очищаем имя файла от русских букв (заменяем на 'photo')
            const safeName = Date.now() + '-' + file.name.replace(/[а-яё]/gi, 'x');
            const uploadRes = await fetch(`/api/admin/upload?filename=${safeName}`, {
                method: 'POST',
                body: file,
            });
            
            if (!uploadRes.ok) throw new Error('Ошибка при загрузке фото');
            
            const blob = await uploadRes.json();
            imageUrl = blob.url;
        }

        // Данные для таблицы
        const product = {
            id: Date.now().toString(),
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            description: document.getElementById('description').value,
            tags: document.getElementById('tags').value,
            images: imageUrl,
            stock: "TRUE"
        };

        // 2. ОТПРАВКА В ТАБЛИЦУ
        // ВАЖНО: Тут слово 'const' перед password НЕ ПИШЕМ, так как она уже создана выше
        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, product }) // Используем ту же переменную
        });

        if (res.ok) {
            alert('🍅 Сорт успешно добавлен!');
            form.reset();
            document.getElementById('adminPassword').value = password; // Возвращаем пароль в поле
            preview.innerHTML = '';
        } else {
            const err = await res.json();
            alert('Ошибка: ' + err.error);
        }
    } catch (error) {
        console.error(error);
        alert('Ошибка: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = '🚀 Опубликовать на сайт';
    }
});
