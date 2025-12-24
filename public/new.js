document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Загрузка данных...';

    const password = document.getElementById('adminPassword').value;
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const tags = document.getElementById('tags').value;
    const props = document.getElementById('props').value;
    const imageFile = document.getElementById('imageUpload').files[0];

    try {
        let imageUrl = '';

        // 1. Загрузка изображения в Vercel Blob
        if (imageFile) {
            submitBtn.innerText = '📸 Загрузка фото...';
            const uploadRes = await fetch('/api/admin/upload', {
                method: 'POST',
                body: imageFile,
                headers: {
                    'x-filename': encodeURI(imageFile.name)
                }
            });
            
            if (!uploadRes.ok) throw new Error('Ошибка при загрузке фото');
            
            const uploadData = await uploadRes.json();
            imageUrl = uploadData.url;
        }

        // 2. Отправка данных в Google Таблицу
        submitBtn.innerText = '📝 Запись в таблицу...';
        const response = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                password, title, category, price, description, tags, props,
                images: imageUrl,
                stock: "TRUE"
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('✅ Успешно! Товар добавлен.');
            e.target.reset();
            document.getElementById('preview').innerHTML = '';
        } else {
            alert('❌ Ошибка: ' + (result.details || result.error));
        }

    } catch (err) {
        console.error(err);
        alert('❌ Критическая ошибка: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = '🚀 Опубликовать на сайт';
    }
});

// Превью картинки
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('preview');
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            preview.innerHTML = `<img src="${event.target.result}" class="mt-4 max-h-48 rounded-lg shadow-md">`;
        };
        reader.readAsDataURL(file);
    }
});
