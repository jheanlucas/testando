const input_principal = document.getElementById("input_csv")
const cards_container = document.getElementById("cards")
const botao_localstorage = document.getElementById("estoque_local")
const botao_limpar = document.getElementById("limpar_estoque")
let produtos = []

//ler o csv
input_principal.addEventListener('change', () => {
    const csv = input_principal.files[0]
    //verifica se o csv foi lido mesmo
    if (!csv) return

    const reader = new FileReader()

    reader.onload = function (event) {
        const texto_do_csv = event.target.result
        
        const linhas = texto_do_csv.split('\n')

        linhas.slice(1).forEach(linha => {
            linha = linha.trim()
            if (linha === "") return

            const colunas = linha.split(';')
            if(isNaN(Number(colunas[0])) || colunas[0] == "") return

            const produto = {
                nome: colunas[1],
                marca: colunas[2],
                cor: colunas[3].split(','),
                numeros: colunas[4].split(',').sort((a,b) => a-b),
                categorias: colunas[5].split(','),
                imagem: colunas[6]
            }
            produtos.push(produto)
        })
        salvar_produtos(produtos)
        alert('CSV importado com sucesso!')
    }
    reader.readAsText(csv)
})

botao_localstorage.addEventListener('click', () => {
    const produtos_salvos = JSON.parse(localStorage.getItem('produtos')) || []
    renderizar_produtos(produtos_salvos)
});

botao_limpar.addEventListener('click', () => {
    if(confirm("Tem certeza que quer apagar?")){
        limpar_localstorage()
    }
})

//salvar os produtos no localstorage
function salvar_produtos(produtos) {
    localStorage.setItem('produtos',JSON.stringify(produtos))
}
//renderiza produtos
function renderizar_produtos(produtos) {
    cards_container.innerHTML = ''

    produtos.forEach(produto => {
        const card = document.createElement('div')
        card.classList.add('card')

        card.innerHTML = `
            <img class="imagem_card" src="${produto.imagem}" alt="${produto.nome}">
            <h3>${produto.nome}</h3>
            <p>Marca: ${produto.marca}</p>
            <p>Cor: ${produto.cor}</p>
            <p>Números: <span id="numeros">${produto.numeros.join(', ')}</span></p>
            <div>
                <button class="botao" id="botao_vender">Vender</button>
                <button class="botao" id="botao_tirar">Tirar</button>
            </div>
        `;
        cards_container.appendChild(card);
    });
}
//limpar localstorage
function limpar_localstorage() {
    localStorage.clear()
}

document.querySelectorAll('.filtro_pesquisa').forEach(container => {
    const input = container.querySelector('input');
    const valores = input.dataset.valores.split(',').map(v => v.trim());

    // cria dropdown dentro do container
    const dropdown = document.createElement('ul');
    dropdown.className = 'dropdown-pesquisa';
    container.appendChild(dropdown);

    function render(lista) {
        dropdown.innerHTML = '';
        lista.forEach(val => {
            const li = document.createElement('li');
            li.textContent = val;
            li.addEventListener('click', () => {
                input.value = val;
                dropdown.style.display = 'none'; // fecha ao selecionar
            });
            dropdown.appendChild(li);
        });
        dropdown.style.display = lista.length ? 'block' : 'none';
    }

    // abrir dropdown ao focar
    input.addEventListener('focus', () => {
        render(valores);
    });

    // filtrar enquanto digita
    input.addEventListener('input', () => {
        const texto = input.value.toLowerCase();
        const filtradas = valores.filter(v => v.toLowerCase().includes(texto));
        render(filtradas);
    });

    // fechar dropdown clicando fora
    document.addEventListener('click', e => {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // prevenir blur ao clicar na opção
    dropdown.addEventListener('mousedown', e => e.preventDefault());
});
