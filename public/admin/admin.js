import { bindImageUpload } from './images.js';
import { renderDesktop, renderMobile } from './ui.js';
import { loadAll, bindListActions, handleSave } from './products.js';

const $ = id => document.getElementById(id);
const isMobile = () => window.innerWidth < 768;

const state = {
  allProducts: [],
  editId: null,
  imageBase64: '',
  imageName: ''
};

// DOM
const productListDesktop = $('productList');
const productListMobile  = $('productListMobile');
const productForm = $('productForm');

const titleInput = $('title');
const categoryInput = $('category');
const priceInput = $('price');
const tagsInput = $('tags');
const descInput = $('description');
const propTerm = $('prop_term');
const propHeight = $('prop_height');
const propWeight = $('prop_weight');
const imageUpload = $('imageUpload');
const imagePreview = $('imagePreview');
const submitBtn = $('submitBtn');
const formTitle = $('formTitle');

let cancelBtn = null;

/* ===== TRANSLIT ===== */
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

const ui = {
  render(list) {
    renderDesktop(productListDesktop, list);
    renderMobile(productListMobile, list);
  }
};

bindImageUpload(imageUpload, imagePreview, state);

function exitEditMode() {
  state.editId = null;
  state.imageBase64 = '';
  state.imageName = '';
  productForm.reset();
  imagePreview.classList.add('hidden');
  formTitle.innerText = '➕ Новый сорт';
  if (cancelBtn) {
    cancelBtn.remove();
    cancelBtn = null;
  }
}

bindListActions(productListDesktop, {
  onEdit(id) {
    if (isMobile()) return;
    const p = state.allProducts.find(x => x.id === id);
    if (!p) return;

    state.editId = id;
    state.imageBase64 = '';
    state.imageName = '';

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

    imagePreview.src = p.images || '';
    imagePreview.classList.remove('hidden');

    if (!cancelBtn) {
      cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.innerText = '✖ Отмена';
      cancelBtn.className =
        'w-full mt-2 bg-gray-200 text-gray-800 py-3 rounded-xl text-lg';
      cancelBtn.onclick = exitEditMode;
      submitBtn.after(cancelBtn);
    }
  },

  async onDelete(id) {
    if (!confirm('Удалить сорт?')) return;
    const { deleteProduct } = await import('./api.js');
    await deleteProduct(id);
    loadAll(state, ui);
  }
});

/* ===== SAVE (НЕ БЛОКИРУЕТ UI) ===== */
productForm.onsubmit = e => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.innerText = '⏳ Сохраняем…';

  handleSave(state, {
    id: state.editId || translit(titleInput.value),
    title: titleInput.value,
    category: categoryInput.value,
    price: priceInput.value,
    tags: tagsInput.value,
    description: descInput.value,
    props:
      `Срок=${propTerm.value};` +
      `Высота=${propHeight.value};` +
      `Вес=${propWeight.value}`
  })
  .then(() => {
    exitEditMode();
    setTimeout(() => loadAll(state, ui), 0);
  })
  .catch(() => {})
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.innerText = '💾 Сохранить сорт';
  });
};

loadAll(state, ui);
