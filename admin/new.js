document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Собираем данные из полей (только те, что есть в вашей форме)
    const productData = {
        password: document.getElementById('adminPassword').value,
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        price: document.getElementById('price').value,
        description: document.getElementById('description').value,
        tags: document.getElementById('tags').value,
        // Сюда же логика для картинки, если она была
    };

    try {
        const response = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            alert('✅ Товар успешно добавлен!');
            e.target.reset(); // Очистить форму
        } else {
            const error = await response.json();
            alert('❌ Ошибка: ' + error.details);
        }
    } catch (err) {
        alert('❌ Ошибка сети: ' + err.message);
    }
});
