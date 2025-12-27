(function () {

  let allProducts = [];
  let editId = null;
  let imageBase64 = '';
  let imageName = '';

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

  const slug = t =>
    t.toLowerCase()
     .replace(/ё/g,'е')
     .replace(/[^a-zа-я0-9]+/g,'-')
     .replace(/^-+|-+$/g,'');

  function resetForm() {
    editId = null;
    imageBase64 = '';
    imageName = '';
    productForm.reset();
    if (imagePreview) imagePreview.classList.add('hidden');
    formTitle.innerText = '➕ Новый сорт';
  }

  async function loadProducts() {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();

    productList.innerHTML = allProducts.map(p => `
      <div class="p-2 border rounded-xl flex items-center gap-3 bg-white">
        <div class="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
          ${p.images ? `<img src="${p.images}" class="w-12 h-12 rounded-lg object-cover">` : '🍅'}
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
    imageBase64 = '';
    imageName = '';

    formTitle.innerText = '✏️ Редактирование сорта';
    titleInput.value = p.title;
    categoryInput.value = p.category;
    priceInput.value = p.price;
    tagsInput.value = p.tags;
    descInput.value = p.description;

    const map = {};
    (p.props || '').split(';').forEach(x => {
      const [k,v] = x.split('=');
      if (k) map[k] = v;
    });

    propTerm.value = map['Срок'] || '';
    propHeight.value = map['Высота'] || '';
    propWeight.value = map['Вес'] || '';

    if (p.images) {
      imagePreview.src = p.images;
      imagePreview.classList.remove('hidden');
    }
  };

  imageUpload.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (!file) return;

    imageName = file.name;

    const reader = new FileReader();
    reader.onload = e => {
      imageBase64 = e.target.result;
      imagePreview.src = imageBase64;
      imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  productForm.onsubmit = async e => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохраняем…';

    try {
      let imageUrl = '';

      if (imageBase64) {
        const up = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: imageName,
            base64: imageBase64
          })
        });
        imageUrl = (await up.json()).url;
      } else if (editId) {
        imageUrl = allProducts.find(p => p.id === editId)?.images || '';
      }

      const props =
        `Срок=${propTerm.value};Высота=${propHeight.value};Вес=${propWeight.value}`;

      const id = editId || slug(titleInput.value);

      await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: titleInput.value,
          price: priceInput.value,
          images: imageUrl,
          category: categoryInput.value,
          tags: tagsInput.value,
          description: descInput.value,
          stock: 'TRUE',
          props
        })
      });

      resetForm();
      loadProducts();

    } catch (e) {
      alert('Ошибка сохранения');
      console.error(e);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = '💾 Сохранить сорт';
    }
  };

  loadProducts();
})();
