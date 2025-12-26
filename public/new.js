(function() {
    const SECRET = 'khvalla74';
    const pathParts = window.location.pathname.split('/');
    const currentPass = pathParts[pathParts.length - 1];

    if (currentPass !== SECRET) {
        document.body.innerHTML = `
            <div class="h-screen flex items-center justify-center bg-gray-900 text-white flex-col">
                <h1 class="text-6xl mb-4 text-red-500 font-bold">🔒 403</h1>
                <p class="text-xl">Доступ ограничен.</p>
            </div>`;
        return;
    }

    let allProducts = [];

    const createSlug = (t) => {
        const tr = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'shh','ы':'y','э':'e','ю':'yu','я':'ya',' ':'-'};
        return t.toLowerCase().split('').map(c => tr[c] || c).join('').replace(/[^a-z0-9-]/g, '');
    };

    async function loadProducts() {
        const res = await fetch('/api/admin/get-products');
        allProducts = await res.json();
        renderProducts(allProducts);
    }

    function renderProducts(list) {
        document.getElementById('productList').innerHTML = list.map(p => `
            <div class="p-3 border rounded-xl flex justify-between items-center bg-white shadow-sm mb-2">
                <div class="overflow-hidden"><div class="font-bold text-sm truncate">${p.title}</div><div class="text-[10px] text-gray-400">${p.id}</div></div>
                <button onclick="editProduct('${p.id}')" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200">Редакт.</button>
            </div>`).join('');
    }

    window.editProduct = (id) => {
        const p = allProducts.find(x => x.id === id);
        if (!p) return;
        document.getElementById('formTitle').innerText = "📝 Изменить: " + p.title;
        document.getElementById('title').value = p.title;
        document.getElementById('title').disabled = true;
        document.getElementById('category').value = p.category;
        document.getElementById('price').value = p.price;
        document.getElementById('description').value = p.description;
        document.getElementById('tags').value = p.tags;
        
        const pMap = {};
        (p.props || "").split(';').forEach(pair => { const [k, v] = pair.split('='); if(k) pMap[k] = v; });
        document.getElementById('prop_term').value = pMap['Срок'] || '';
        document.getElementById('prop_height').value = pMap['Высота'] || '';
        document.getElementById('prop_weight').value = pMap['Вес'] || '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        btn.disabled = true; btn.innerText = '⌛ Сохранение...';

        const file = document.getElementById('imageUpload').files[0];
        let imageUrl = '';

        try {
            if (file) {
                const up = await fetch('/api/admin/upload', { method: 'POST', body: file, headers: { 'x-filename': encodeURI(file.name) } });
                const r = await up.json(); imageUrl = r.url;
            } else {
                const ex = allProducts.find(p => p.id === createSlug(document.getElementById('title').value));
                if (ex) imageUrl = ex.images;
            }

            const props = `Срок=${document.getElementById('prop_term').value};Высота=${document.getElementById('prop_height').value};Вес=${document.getElementById('prop_weight').value}`;

            await fetch('/api/admin/add-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: SECRET,
                    id: createSlug(document.getElementById('title').value),
                    title: document.getElementById('title').value,
                    category: document.getElementById('category').value,
                    price: document.getElementById('price').value,
                    description: document.getElementById('description').value,
                    tags: document.getElementById('tags').value,
                    props: props,
                    images: imageUrl
                })
            });
            alert('✅ Готово!');
            document.getElementById('title').disabled = false;
            e.target.reset(); loadProducts();
        } catch (err) { alert('❌ Ошибка'); }
        finally { btn.disabled = false; btn.innerText = '🚀 Сохранить'; }
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        const t = e.target.value.toLowerCase();
        renderProducts(allProducts.filter(p => p.title.toLowerCase().includes(t)));
    });

    loadProducts();
})();
