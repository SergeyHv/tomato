let allProducts = [];

// 1. Сессионный ключ
function getAuth() {
    let key = sessionStorage.getItem('admin_key');
    if (!key) {
        key = prompt("Введите ключ администратора:");
        sessionStorage.setItem('admin_key', key);
    }
    return key;
}

// 2. Загрузка данных
async function load() {
    const res = await fetch('/api/admin/products');
    allProducts = await res.json();
    renderList();
}

// 3. Отображение списка слева
function renderList() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const listDiv = document.getElementById('productList');
    
    const filtered = allProducts.filter(p => p.title.toLowerCase().includes(query) || p.id.includes(query));
    
    listDiv.innerHTML = filtered.map(p => `
        <div class="product-item" onclick="editProduct('${p.id}')">
            <img src="${p.images}" onerror="this.src='https://via.placeholder.com/50'">
            <div>
                <strong>${p.title}</strong><br>
                <small>${p.id} | ${p.price}₽</small>
            </div>
            <button onclick="deleteProduct(event, '${p.id}')" style="margin-left:auto; border:none; background:none;">🗑️</button>
        </div>
    `).join('');
}

// 4. Заполнение формы для редактирования
function editProduct(id) {
    const p = allProducts.find(item => item.id === id);
    document.getElementById('formTitle').innerText = "Редактирование: " + p.title;
    document.getElementById('id').value = p.id;
    document.getElementById('title').value = p.title;
    document.getElementById('price').value = p.price;
    document.getElementById('images').value = p.images;
    document.getElementById('category').value = p.category;
    document.getElementById('description').value = p.description;
    document.getElementById('stock').value = p.stock;
}

// 5. Сохранение (Создание или Обновление)
async function saveProduct() {
    const product = {
        id: document.getElementById('id').value,
        title: document.getElementById('title').value,
        price: document.getElementById('price').value,
        images: document.getElementById('images').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        stock: document.getElementById('stock').value,
        tags: "", // Для простоты пока пусто
        props: ""
    };

    const res = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'x-admin-key': getAuth() },
        body: JSON.stringify(product)
    });

    if (res.ok) {
        alert("Успешно сохранено!");
        load(); // Обновляем список
    } else {
        alert("Ошибка! Проверьте ключ.");
    }
}

async function deleteProduct(event, id) {
    event.stopPropagation();
    if (!confirm("Удалить этот сорт?")) return;
    
    await fetch(`/api/admin/delete-product?id=${id}`, {
        headers: { 'x-admin-key': getAuth() }
    });
    load();
}

load();
