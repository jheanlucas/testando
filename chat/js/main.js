let estoque = [];
let vendas = [];
let produtoAtual = null;

function salvarLocal() {
    localStorage.setItem('estoque', JSON.stringify(estoque));
    localStorage.setItem('vendas', JSON.stringify(vendas));
}

function carregarLocal() {
    const est = localStorage.getItem('estoque');
    const vends = localStorage.getItem('vendas');
    estoque = est ? JSON.parse(est) : [];
    vendas = vends ? JSON.parse(vends) : [];
}

// Renderização de produtos
function renderizar(produtos) {
    const container = document.getElementById('produtos');
    container.innerHTML = '';
    produtos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${p.imagem}" alt="${p.nome}">
            <div class="card-info">
                <h3>${p.nome}</h3>
                <p><strong>Categoria:</strong> ${p.categoria}</p>
                <p><strong>Quantidade:</strong> ${p.quantidade}</p>
            </div>
            <div class="card-actions">
                <button class="btn-vender">Vender</button>
                <button class="btn-tirar">Tirar</button>
            </div>
        `;
        // Eventos dos botões
        card.querySelector('.btn-vender').addEventListener('click', () => abrirModal(p));
        card.querySelector('.btn-tirar').addEventListener('click', () => {
            estoque.splice(estoque.indexOf(p),1);
            salvarLocal();
            aplicarFiltros();
        });
        container.appendChild(card);
    });
}

// Filtros
function atualizarCategorias() {
    const container = document.getElementById('categoryFilter');
    const categorias = [...new Set(estoque.map(p=>p.categoria))];
    container.innerHTML = '';
    categorias.forEach(cat=>{
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.dataset.cat = cat;
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            aplicarFiltros();
        });
        container.appendChild(btn);
    });
}

function aplicarFiltros() {
    let filtrados = [...estoque];
    // pesquisa
    const search = document.getElementById('search').value.toLowerCase();
    if(search) filtrados = filtrados.filter(p=>p.nome.toLowerCase().includes(search));
    // categorias
    const activeCats = Array.from(document.querySelectorAll('#categoryFilter button.active')).map(b=>b.dataset.cat);
    if(activeCats.length>0) filtrados = filtrados.filter(p=>activeCats.includes(p.categoria));
    renderizar(filtrados);
}

// Modal de venda
const modal = document.getElementById('modalVenda');
const closeModal = modal.querySelector('.close');
const parcelasContainer = document.getElementById('parcelasContainer');
closeModal.onclick = ()=>modal.style.display='none';
window.onclick = e=>{ if(e.target===modal) modal.style.display='none'; }

document.getElementById('modalPagamento').addEventListener('change', function(){
    parcelasContainer.style.display = this.value==='credito'?'block':'none';
});

function abrirModal(prod) {
    produtoAtual = prod;
    document.getElementById('modalProdutoNome').textContent = prod.nome;
    document.getElementById('modalPreco').value = '';
    document.getElementById('modalPagamento').value = 'pix';
    document.getElementById('modalParcelas').value = 1;
    parcelasContainer.style.display = 'none';
    modal.style.display = 'flex';
}

document.getElementById('confirmVenda').addEventListener('click', ()=>{
    const preco = parseFloat(document.getElementById('modalPreco').value);
    const pagamento = document.getElementById('modalPagamento').value;
    const parcelas = parseInt(document.getElementById('modalParcelas').value);
    if(isNaN(preco)||preco<=0){ alert('Digite o preço'); return; }
    vendas.push({...produtoAtual, preco, pagamento, parcelas: pagamento==='credito'?parcelas:1});
    estoque.splice(estoque.indexOf(produtoAtual),1);
    salvarLocal();
    modal.style.display='none';
    aplicarFiltros();
});

// Export CSV
function exportCSV(arr, filename){
    if(arr.length===0){ alert('Nada para exportar'); return; }
    const header = Object.keys(arr[0]).join(';');
    const rows = arr.map(p=>Object.values(p).join(';')).join('\n');
    const csv = header+'\n'+rows;
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Eventos
document.getElementById('search').addEventListener('input', aplicarFiltros);
document.getElementById('exportStock').addEventListener('click', ()=>exportCSV(estoque,'estoque_atual.csv'));
document.getElementById('exportSales').addEventListener('click', ()=>exportCSV(vendas,'vendas.csv'));

document.getElementById('csvFile').addEventListener('change', function(e){
    const file = e.target.files[0];
    if(!file) return;
    Papa.parse(file,{
        header:true,
        skipEmptyLines:true,
        complete: function(results){
            estoque = results.data.filter(p=>p.nome).map(p=>{
                return {
                    nome: p.nome,
                    categoria: p.categoria,
                    quantidade: parseInt(p.quantidade)||1,
                    imagem: p.imagem
                };
            });
            salvarLocal();
            atualizarCategorias();
            aplicarFiltros();
        }
    });
});

// Inicializa
carregarLocal();
atualizarCategorias();
aplicarFiltros();
