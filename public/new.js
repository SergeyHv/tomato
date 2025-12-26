(function () {
  const SECRET = 'khvalla74';

  let allProducts = [];
  let editId = null;

  /* ===== УДОБНЫЙ ДОСТУП К ЭЛЕМЕНТАМ ===== */
  const $ = id => document.getElementById(id);

  const productList   = $('productList');
  const productForm   = $('productForm');
  const titleInput    = $('title');
  const categoryInput = $('category');
  const priceInput    = $('price');
  const tagsInput     = $('tags');
  const descInput     = $('description');
  const propTerm      = $('prop_term');
  const propHeight    = $('prop_height');
  const propWeight    = $('prop_weight');
  const imageUpload   = $('imageUpload');
  const imagePreview  = $('imagePreview');
  const submitBtn     = $('submitBtn');
  const formTitle     = $('formTitle');
  const toast         = $('toast');
  const searchInput   = $('searchInput');

  if (!productForm || !productList || !titleInput) {
    console.error('❌ Критические элементы не найдены');
    return;
  }

  /* ===== SLUG ===== */
  const slug = t =>
    t.toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^a-zа-я0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  /* ===== УВЕДОМЛЕНИЯ ===== */
  function showToast(text, ok = true) {
    if (!toast) {
      alert(text);
      return;
    }
    toast.innerText = text;
    toast.className =
      `fixed bottom-5 right-5 px-6 py-4 rounded-xl text-white text-lg shadow-lg ${
        ok ? 'bg-green-600' : 'bg-red-600'
      }`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  /* ===== ЗАГРУЗКА СПИСКА ===== */
  async function loadProducts(highlightId = null) {
    try {
      const res = await fetch('/api/admin/get-products');
      allProducts = await res.json();

      productList.innerHTML = allProducts.map(p => `
        <div class="p-2 border rounded-xl flex items-center gap-3
          ${p.id === highlightId ? 'bg-green-50 border-green-400' : 'bg-white'}">

          <!-- ФОТО -->
          <img
            src="${p.images || 'https://via.placeholder.com/48x48?text=🍅'}"
            class="w-12 h-12 rounded-lg object-cover border"
          >

          <!-- НАЗВАНИЕ -->
          <div class="flex-1 truncate">
            <div class="font-semibold text-sm">${p.title}</div>
            <div class="text-xs text-gray-500">${p.category || ''}</div>
          </div>

          <!-- КНОПКИ -->
          <div class="flex gap-2">
            <button onclick="window.__editProduct('${p.id}')"
              title="Редактировать"
              class="text-lg">✏️</button>

            <button onclick="window.__deleteProduct('${p.id}')"
              title="Удалить"
              class="text-lg">🗑</button>
          </div>
        </div>
      `).join('');
    } catch (e) {
      showToast('❌ Ошибка загрузки списка', false);
    }
  }

  /* ===== РЕДАКТИРОВАНИЕ ===== */
  window.__editProduct = function (id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    editId = id;
    if (formTitle) formTitle.innerText = '✏️ Редактирование сорта';

    titleInput.value    = p.title || '';
    categoryInput.value = p.category || '';
    priceInput.value    = p.price || '';
    tagsInput.value     = p.tags || '';
    descInput.value     = p.description || '';

    const map = {};
    (p.props || '').split(';').forEach(i => {
      const [k, v] = i.split('=');
      if (k) map[k] = v;
    });

    propTerm.value   = map['Срок'] || '';
    propHeight.value = map['Высота'] || '';
    propWeight.value = map['Вес'] || '';

    if (p.images && imagePreview) {
      imagePreview.src = p.images;
      imagePreview.classList.remove('hidden');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ===== УДАЛЕНИЕ ===== */
  window.__deleteProduct = async function (id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    const ok = confirm(`Удалить сорт:\n\n"${p.title}" ?\n\nЭто действие
