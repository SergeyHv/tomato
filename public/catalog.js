let products = [];
const catalog = document.getElementById('catalog');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');

fetch('/api/products')
  .then(res => res.json())
  .then(data => {
    products = data;
    renderCards(products);
  });

function renderCards(items) {
  catalog.innerHTML = '';
  items.forEach(product => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${product.images}" alt="${product.title}">
      <div class="card-content">
        <h2 class="card-title">${product.title}</h2>
        <p class="card-tags">${product.tags}</p>
      </div>
    `;
    card.addEventListener('click', () => showModal(product));
    catalog.appendChild(card);
  });
}

function showModal(product) {
  modalContent.innerHTML = `
    <span class="close" id="closeBtn">&times;</span>
    <img src="${product.images}" alt="${product.title}">
    <h2>${product.title}</h2>
    <p><strong>Категория:</strong> ${product.category}</p>
    <p><strong>Описание:</strong> ${product.description}</p>
    <p><strong>Характеристики:</strong> ${product.props}</p>
    <p><strong>Теги:</strong> ${product.tags}</p>
  `;
  modal.style.display = 'flex';
  document.getElementById('closeBtn').onclick = () => modal.style.display = 'none';
}

// Фильтрация по кнопкам
document.querySelectorAll('.controls button').forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    let filtered = products;
    if (category !== 'all') {
      filtered = products.filter(p => p.category === category);
    }
    renderCards(filtered);
  });
});

// Поиск
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.tags.toLowerCase().includes(query)
  );
  renderCards(filtered);
});

// Сортировка
sortSelect.addEventListener('change', e => {
  let sorted = [...products];
  switch (e.target.value) {
    case 'title-asc':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      sorted.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'stock':
      sorted.sort((a, b) => b.stock.localeCompare(a.stock));
      break;
  }
  renderCards(sorted);
});

// Закрытие модалки по клику вне
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
