let allProducts = [];
let currentEditingId = null;

// 1. Управление авторизацией
function getAuth() {
    let key = sessionStorage.getItem('admin_key');
    if (!key) {
        key = prompt("Введите ключ доступа (admin-key):");
        if (key) sessionStorage.setItem('admin_key', key);
    }
    return key;
}

// 2. Загрузка данных при старте
async function loadData() {
    const res = await fetch('/api/admin/products');
    if (res.ok) {
        allProducts = await res.json();
        renderList();
    } else {
        alert("Ошибка загрузки данных. Проверьте соединение.");
    }
}

// 3. Отрисовка списка слева
function renderList() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const listDiv = document.getElementById('productList');
    
    const filtered = allProducts.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.id.toLowerCase().includes(query)
    );
    
    listDiv.innerHTML = filtered.map(p => `
        <div class="product-item ${currentEditingId === p.id ? 'active' : ''}" onclick="editProduct('${p.id}')">
            <img src="${p.images || 'https://via.placeholder.com/50'}" alt="">
            <div style="flex-grow: 1;">
                <strong>${p.title}</strong><br>
                <small>${p.id} | ${p.price} ₽</small>
            </div>
            <button class="btn-icon" onclick="deleteProduct(event, '${p.id}')" title="Удалить">🗑️</button>
        </div>
    `).join('');
}

// 4. Переключение формы в режим редактирования
function editProduct(id) {
    currentEditingId = id;
    const p = allProducts.find(item => item.id === id);
    if (!p) return;

    document.getElementById('formTitle').innerText = "Редактирование сорта";
    document.getElementById('id').value = p.id;
    document.getElementById('title').value = p.title;
    document.getElementById('price').value = p.price;
    document.getElementById('images').value = p.images;
    document.getElementById('category').value = p.category;
    document.getElementById('tags').value = p.tags || "";
    document.getElementById('description').value = p.description;
    document.getElementById('stock').value = p.stock;
    document.getElementById('props').value = p.props || "";
    
    renderList(); // Чтобы подсветить активный элемент
}

// 5. Очистка формы для нового сорта
function resetForm() {
    currentEditingId = null;
    document.getElementById('formTitle').innerText = "Новый сорт";
    document.getElementById('productForm').reset();
    renderList();
}

// 6. Загрузка изображения в Vercel Blob
async function uploadImage(file) {
    const key = getAuth();
    if (!file || !key) return;

    const statusLabel = document.getElementById('imageStatus');
    statusLabel.innerText = "⏳ Загрузка фото...";

    const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
            'x-admin-key': key,
            'x-filename': file.name,
            'content-type': file.type
        },
        body: file
    });

    if (res.ok) {
        const data = await res.json();
        document.getElementById('images').value = data.url;
        statusLabel.innerText = "✅ Фото загружено";
    } else {
        statusLabel.innerText = "❌ Ошибка загрузки";
        alert("Ошибка при загрузке фото. Проверьте ключ.");
    }
}

// 7. Сохранение (Создание / Обновление)
async function saveProduct() {
    const key = getAuth();
    if (!key) return;

    const product = {
        id: document.getElementById('id').value,
        title: document.getElementById('title').value,
        price: document.getElementById('price').value,
        images: document.getElementById('images').value,
        category: document.getElementById('category').value,
        tags: document.getElementById('tags').value,
        description: document.getElementById('description').value,
        stock: document.getElementById('stock').value,
        props: document.getElementById('props').value
    };

    if (!product.id || !product.title) return alert("ID и Название обязательны!");

    const res = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 
            'x-admin-key': key,
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(product)
    });

    if (res.ok) {
        alert("Сохранено успешно!");
        loadData(); // Перезагружаем список
    } else {
        alert("Ошибка сохранения. Возможно, неверный ключ.");
    }
}

// 8. Оптимистичное удаление
async function deleteProduct(event, id) {
    event.stopPropagation();
    const key = getAuth();
    if (!key || !confirm(`Удалить сорт ${id}?`)) return;

    // Сразу убираем из списка для скорости
    allProducts = allProducts.filter(p => p.id !== id);
    renderList();

    const res = await fetch(`/api/admin/delete-product?id=${id}`, {
        headers: { 'x-admin-key': key }
    });

    if (!res.ok) {
        alert("Ошибка на сервере. Данные не удалены.");
        loadData(); // Возвращаем как было
    }
}

// Инициализация загрузки фото
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.onchange = (e) => uploadImage(e.target.files[0]);
    document.body.appendChild(fileInput);

    // Привязываем клик по кнопке "Загрузить фото" (если она будет в HTML)
    window.triggerUpload = () => fileInput.click();
    
    loadData();
});
