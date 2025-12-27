(function () {

  let allProducts = [];
  let editId = null;
  let lastUploadedImage = ''; // ← ВАЖНО

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

  const slug = t =>
    t.toLowerCase()
     .replace(/ё/g,'е')
     .replace(/[^a-zа-я0-9]+/g,'-')
     .replace(/^-+|-+$/g,'');

  function toastMsg(text, ok = true) {
    if (!toast) return alert(text);
    toast.innerText = text;
    toast.className =
      `fixed bottom-5 right-5 px-6 py-4 rounded-xl text-white ${
        ok ? 'bg-green-600' : 'bg-red-600'
      }`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
  }

  function resetForm() {
    editId = null;
    lastUploadedImage = '';
    productForm.reset();
    if (imagePreview) imagePreview.classList.add('hidden');
    if (formTitle) formTitle.innerText = '➕ Новый сорт';
  }

  async function loadProducts() {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();

    productList.innerHTML = allProducts.map(p => `
      <div class="p-2 border rounded-xl flex items-center gap-3 bg-white">
        <div class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
          ${p.images
            ? `<img src="${p.images}" class="w-12 h-12 rounded-lg object-cover">`
            : '🍅'}
        </div>
        <div class="flex-1 truncate">
          <div class="font-semibold text-sm">${p.title}</div>
          <div class="text-xs text-gray-500">${p.category || ''}</div>
        </div>
        <button onclick="edit('${p.id}')">✏️</button>
      </div>
    `).join('');
  }

  window.edit = id => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    editId = id;
    lastUploadedImage = p.images || '';

    formTitle.innerText = '✏️ Редактирование сорта';
    titleInput.value = p.title || '';
    categoryInput.value = p.category || '';
    priceInput.value = p.price || '';
    tagsInput.value = p.tags || '';
    descInput.value = p.description || '';

    const map = {};
    (p.props || '').split(';').forEach(x => {
      const [k,v] = x.split('=');
      if (k) map[k] = v;
    });

    propTerm.value = map['Срок'] || '';
    propHeight.value = map['Высота'] || '';
    propWeight.value = map['Вес'] || '';

    if (p.images && imagePreview) {
      imagePreview.src = p.images;
      imagePreview.classList.remove('hidden');
    }
  };

  productForm.onsubmit = async e => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохраняем…';

    try {
      if (imageUpload.files[0]) {
        const up = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'x-filename': encodeURIComponent(imageUpload.files[0].name)
          },
          body: imageUpload.files[0]
        });
        lastUploadedImage = (await up.json()).url;
      }

      const props =
        `Срок=${propTerm.value};Высота=${propHeight.value};Вес=${propWeight.value}`;

      const savedId = editId || slug(titleInput.value);

      await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: savedId,
          title: titleInput.value,
          price: priceInput.value,
          images: lastUploadedImage, // ← ВСЕГДА
          category: categoryInput.value,
          tags: tagsInput.value,
          description: descInput.value,
          stock: 'TRUE',
          props
        })
      });

      toastMsg(editId ? '✅ Обновлено' : '✅ Добавлено');
      resetForm();
      loadProducts();

    } catch (err) {
      console.error(err);
      toastMsg('❌ Ошибка', false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = '💾 Сохранить сорт';
    }
  };

  loadProducts();
})();
