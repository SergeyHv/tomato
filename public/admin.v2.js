(function () {

  const ADMIN_PASSWORD = 'khvalla74';

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

  /* ===== UTILS ===== */

  const translit = str => {
    const map = {
      а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',
      и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',
      р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',
      ч:'ch',ш:'sh',щ:'sch',ы:'y',э:'e',ю:'yu',я:'ya'
    };
    return str.toLowerCase().split('')
      .map(ch => map[ch] || ch)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  function showToast(text, ok = true) {
    toast.innerText = text;
    toast.className =
      `fixed bottom-5 right-5 px-6 py-4 rounded-xl text-white text-lg shadow-lg ${
        ok ? 'bg-green-600' : 'bg-red-600'
      }`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2500);
  }

  /* ===== RENDER ===== */

  function renderDesktop(list) {
    if (!productListDesktop) return;
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

  async function loadProducts() {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();
    renderDesktop(allProducts);
    renderMobile(allProducts);
  }

  /* ===== EDIT / DELETE ===== */

  window.editProduct = id => {
    if (isMobile()) return;

    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    editId = id;
    imageBase64 = '';
    imageName = '';

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

    imagePreview.src = bust(p.images);
    imagePreview.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.deleteProduct = async id => {
    if (!confirm('Удалить сорт?')) return;

    await fetch('/api/admin/delete-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        password: ADMIN_PASSWORD
      })
    });

    showToast('Сорт удалён');
    await loadProducts();
  };

  /* ===== IMAGE ===== */

  imageUpload.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (!file) return;

    imageName = file.name;
    const reader = new FileReader();
    reader.onload = e => {
      imageBase64 = e.target.result;
      imagePreview.src = e.target.result;
      imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  /* ===== SAVE ===== */

  productForm.onsubmit = async e => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохраняем…';

    try {
      const id = editId || translit(titleInput.value);
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

      const res = await fetch('/api/admin/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: ADMIN_PASSWORD,
          id,
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

      if (!res.ok) throw new Error('SAVE FAILED');

      showToast(editId ? 'Изменения сохранены' : 'Сорт добавлен');

      editId = null;
      productForm.reset();
      imagePreview.classList.add('hidden');

      await loadProducts();

    } catch (err) {
      console.error(err);
      showToast('Ошибка сохранения', false);
    }

    submitBtn.disabled = false;
    submitBtn.innerText = '💾 Сохранить сорт';
  };

  /* ===== INIT ===== */

  loadProducts();

})();
