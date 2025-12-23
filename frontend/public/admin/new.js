let allProducts = [];
let isEditing = false;
let selectedId = null; // Для подсветки

document.addEventListener('DOMContentLoaded', () => {
    const savedPass = localStorage.getItem('tomato_admin_pass');
    if (savedPass) document.getElementById('adminPassword').value = savedPass;
    loadProducts();
});

async function loadProducts() {
    const listContainer = document.getElementById('productList');
    try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        renderList(allProducts);
    } catch (error) {
        listContainer.innerHTML = '<p class="p-4 text-red-500 text-sm">Ошибка загрузки списка</p>';
    }
}

function renderList(products) {
    const listContainer = document.getElementById('productList');
    listContainer.innerHTML = '';

    const query = document.getElementById('searchInput').value.toLowerCase();
    const fGrowth = document.getElementById('filterGrowth').value;
    const fColor = document.getElementById('filterColor').value;

    const filtered = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(query);
        const matchesGrowth = fGrowth === "" || p.growth_type === fGrowth;
        const matchesColor = fColor === "" || p.color === fColor;
        const isNotArchived = p.status !== 'archived';
        return matchesSearch && matchesGrowth && matchesColor && isNotArchived;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = '<p class="p-4 text-gray-400 italic text-sm text-center">Ничего не найдено</p>';
        return;
    }

    filtered.reverse().forEach(p => {
        const div = document.createElement('div');
        // Добавляем класс active-card если ID совпадает с выбранным
        const isActive = p.id === selectedId ? 'active-card shadow-inner' : 'bg-white';
        div.className = `${isActive} border rounded-lg p-2 flex items-center gap-3 cursor-pointer hover:shadow-md transition shadow-sm`;
        div.onclick = () => startEdit(p);
        
        div.innerHTML = `
            <img src="${p.images || 'https://via.placeholder.com/50?text=No+Pic'}" class="w-12 h-12 object-cover rounded-md flex-shrink-0">
            <div class="flex-1 overflow-hidden">
                <h4 class="font-bold text-sm truncate">${p.title}</h4>
                <p class="text-xs text-gray-500">${p.price} р. | ${p.growth_type || '—'}</p>
            </div>
            <button onclick="archiveProduct(event, '${p.id}')" class="text-gray-400 hover:text-red-500 p-1" title="В архив">
                🗑️
            </button>
        `;
        listContainer.appendChild(div);
    });
}

document.getElementById('searchInput').addEventListener('input', () => renderList(allProducts));
document.getElementById('filterGrowth').addEventListener('change', () => renderList(allProducts));
document.getElementById('filterColor').addEventListener('change', () => renderList(allProducts));

function startEdit(product) {
    isEditing = true;
    selectedId = product.id; // Запоминаем ID для подсветки
    renderList(allProducts); // Перерисовываем список, чтобы применить стиль

    document.getElementById('formTitle').innerText = '📝 Редактировать сорт';
    document.getElementById('submitBtn').innerText = '💾 Сохранить изменения';
    document.getElementById('cancelEdit').classList.remove('hidden');

    document.getElementById('editId').value = product.id;
    document.getElementById('title').value = product.title;
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category || 'tomatoes';
    document.getElementById('description').value = product.description || '';
    document.getElementById('growth_type').value = product.growth_type || '';
    document.getElementById('color').value = product.color || '';
    document.getElementById('shape').value = product.shape || '';
    document.getElementById('maturity').value = product.maturity || '';
    
    if (product.images) {
        document.getElementById('preview').innerHTML = `<img src="${product.images}" class="h-20 w-20 object-cover rounded shadow">`;
    }
}

document.getElementById('cancelEdit').onclick = () => {
    resetForm();
};

function resetForm() {
    isEditing = false;
    selectedId = null;
    document.getElementById('productForm').reset();
    document.getElementById('formTitle').innerText = 'Добавить новый сорт';
    document.getElementById('submitBtn').innerText = '🚀 Опубликовать';
    document.getElementById('cancelEdit').classList.add('hidden');
    document.getElementById('preview').innerHTML = '';
    renderList(allProducts);
}

document.getElementById('productForm').onsubmit = async (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    if (!password) return alert("Введите пароль!");
    
    const title = document.getElementById('title').value.trim();

    // ЗАЩИТА ОТ ДУБЛЕЙ (только при создании нового)
    if (!isEditing) {
        const duplicate = allProducts.find(p => p.title.toLowerCase() === title.toLowerCase() && p.status !== 'archived');
        if (duplicate) {
            alert(`🛑 Ошибка! Сорт с названием "${title}" уже есть в списке.`);
            return;
        }
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохранение...';

    try {
        let imageUrl = document.querySelector('#preview img')?.src || '';
        const fileInput = document.getElementById('imageUpload');
        const file = fileInput.files[0];

        if (file) {
            const safeName = Date.now() + '-' + file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
            const uploadRes = await fetch(`/api/admin/upload?filename=${safeName}`, { method: 'POST', body: file });
            const blob = await uploadRes.json();
            imageUrl = blob.url;
        }

        const productData = {
            id: isEditing ? document.getElementById('editId').value : Date.now().toString(),
            title: title,
            price: document.getElementById('price').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            color: document.getElementById('color').value,
            growth_type: document.getElementById('growth_type').value,
            shape: document.getElementById('shape').value,
            maturity: document.getElementById('maturity').value,
            images: imageUrl,
            status: 'active',
            stock: 'TRUE'
        };

        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, product: productData })
        });

        if (res.ok) {
            alert(isEditing ? '✅ Изменено!' : '🍅 Добавлено!');
            // Вместо полной перезагрузки страницы, обновляем данные локально
            await loadProducts();
            resetForm();
        } else {
            const err = await res.json();
            alert('Ошибка: ' + (err.error || 'Доступ запрещен'));
        }
    } catch (error) {
        alert('Ошибка: ' + error.message);
    } finally {
        submitBtn.disabled = false;
    }
};

async function archiveProduct(event, id) {
    event.stopPropagation();
    if (!confirm('Отправить сорт в архив?')) return;

    const password = document.getElementById('adminPassword').value;
    if (!password) return alert("Введите пароль для подтверждения!");

    // Находим актуальные данные товара из массива
    const sourceProduct = allProducts.find(p => p.id === id);
    if (!sourceProduct) return;

    // Создаем копию объекта и меняем статус
    const updatedProduct = { ...sourceProduct, status: 'archived' };

    try {
        const res = await fetch('/api/admin/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, product: updatedProduct })
        });
        
        if (res.ok) {
            await loadProducts();
            if (selectedId === id) resetForm();
        } else {
            const err = await res.json();
            alert('Не удалось заархивировать: ' + (err.error || 'ошибка сервера'));
        }
    } catch (e) {
        alert('Ошибка связи с сервером');
    }
}

document.getElementById('imageUpload').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('preview').innerHTML = `<img src="${event.target.result}" class="h-20 w-20 object-cover rounded shadow">`;
        };
        reader.readAsDataURL(file);
    }
};
// Функция ПОЛНОГО удаления (для дубликатов)
async function deleteForever(event, id) {
    event.stopPropagation();
    if (!confirm('⚠️ ВНИМАНИЕ! Это удалит сорт из таблицы НАВСЕГДА. Вы уверены?')) return;

    const password = document.getElementById('adminPassword').value;
    
    try {
        const res = await fetch('/api/admin/delete-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, id })
        });
        
        if (res.ok) {
            alert('Удалено безвозвратно');
            loadProducts();
            resetForm();
        } else {
            alert('Ошибка при удалении');
        }
    } catch (e) {
        alert('Ошибка связи');
    }
}
