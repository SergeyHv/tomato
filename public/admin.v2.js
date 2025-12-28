(function () {

  let allProducts = [];
  let editId = null;
  let imageBase64 = '';
  let imageName = '';

  const $ = id => document.getElementById(id);
  const isMobile = () => window.innerWidth < 768;
  const bust = url => url ? `${url}?t=${Date.now()}` : '';

  const productListDesktop = $('productList');
  const productListMobile  = $('productListMobile');
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

  function showToast(text) {
    toast.innerText = text;
    toast.className =
      'fixed bottom-5 right-5 px-6 py-4 rounded-xl text-white text-lg shadow-lg bg-green-600';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2500);
  }

  async function loadProducts() {
    const res = await fetch('/api/admin/get-products', {
      credentials: 'same-origin'
    });
    allProducts = await res.json();
    renderDesktop(allProducts);
    renderMobile(allProducts);
  }

  function renderDesktop(list) {
    productListDesktop.innerHTML = list.map(p => `
      <div class="p-2 border rounded-xl flex items-center gap-3 bg-white">
        <img src="${bust(p.images)}" class="w-12 h-12 rounded-lg object-cover">
        <div class="flex-1">
          <div class="font-semibold">${p.title}</div>
          <div class="text-sm text-gray-500">${p.category}</div>
        </div>
        <button onclick="editProduct('${p.id}')">✏️</button>
        <button onclick="deleteProduct('${p.id}')">🗑</button>
      </div>
    `).join('');
  }

  function renderMobile(list) {
    if (!productListMobile) return;
    productListMobile.innerHTML = list.map(p => `
      <div class="p-2 border rounded-xl bg-white flex gap-3">
        <img src="${bust(p.images)}" class="w-12 h-12 rounded-lg object-cover">
        <div>
          <div class="font-semibold">${p.title}</div>
          <div class="text-sm text-gray-500">${p.category}</div>
        </div>
      </div>
    `).join('');
  }

  window.editProduct = id => {
    if (isMobile()) return;
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    editId = id;
    imageBase64 = '';
    imageName = '';

    formTitle.innerText = '✏️ Редактирование сорта';

    titleInput.value = p.title;
    categoryInput.value = p.category;
    priceInput.value = p.price || '';
    tagsInput.value = p.tags || '';
    descInput.value = p.description || '';

    const map = {};
    (p.props || '').split(';').forEach(x => {
      const [k,v] = x.split('=');
      map[k] = v;
    });

    propTerm.value = map['Срок'] || '';
    propHeight.value = map['Высота'] || '';
    propWeight.value = map['Вес'] || '';

    imagePreview.src = bust(p.images);
    imagePreview.classList.remove('hidden');
  };

  imageUpload.onchange = () => {
    const file = imageUpload.files[0];
    if (!file) return;
    imageName = file.name;
    const r = new FileReader();
    r.onload = e => {
      imageBase64 = e.target.result;
      imagePreview.src = e.target.result;
      imagePreview.classList.remove('hidden');
    };
    r.readAsDataURL(file);
  };

  productForm.onsubmit = async e => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохраняем…';

    let imageUrl = '';

    if (imageBase64) {
      const up = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: imageName, base64: imageBase64 }),
        credentials: 'same-origin'
      });
      imageUrl = (await up.json()).url;
    } else if (editId) {
      imageUrl = allProducts.find(p => p.id === editId)?.images || '';
    }

    const res = await fetch('/api/admin/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        id: editId,
        title: titleInput.value,
        category: categoryInput.value,
        price: priceInput.value,
        tags: tagsInput.value,
        description: descInput.value,
        props:
          `Срок=${propTerm.value};` +
          `Высота=${propHeight.value};` +
          `Вес=${propWeight.value}`,
        images: imageUrl
      })
    });

    if (!res.ok) {
      alert('Ошибка сохранения (авторизация)');
      submitBtn.disabled = false;
      submitBtn.innerText = '💾 Сохранить';
      return;
    }

    showToast(editId ? 'Изменения сохранены' : 'Сорт добавлен');
    editId = null;
    productForm.reset();
    imagePreview.classList.add('hidden');

    await loadProducts();

    submitBtn.disabled = false;
    submitBtn.innerText = '💾 Сохранить';
  };

  window.deleteProduct = async id => {
    if (!confirm('Удалить сорт?')) return;
    await fetch('/api/admin/delete-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ id, password: 'khvalla74' })
    });
    showToast('Сорт удалён');
    await loadProducts();
  };

  loadProducts();

})();
