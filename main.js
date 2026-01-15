const input_principal = document.getElementById("input_csv")
const cards_container = document.getElementById("cards")
const botao_localstorage = document.getElementById("estoque_local")
const botao_limpar = document.getElementById("limpar_estoque")
const modal = document.getElementById("modal_venda")
const numeracoes_container = document.getElementById("numeracoes_container")
const pagamento = document.getElementById("pagamento")
const campo_parcelas = document.getElementById("campo_parcelas")
const cancelar_venda = document.getElementById("cancelar_venda")
const confirmar_venda = document.getElementById("confirmar_venda")
const preco_input = document.getElementById("preco")
const nome_modal = document.getElementById("nome_do_modal")

let produtos = []
let produtoAtual = null
let numeroSelecionado = null

/*Ler o CSV*/
input_principal.addEventListener('change', () => {
    const csv = input_principal.files[0]
    if (!csv) return

    const reader = new FileReader()

    reader.onload = function (event) {
        const texto = event.target.result
        const linhas = texto.split('\n')
        produtos = []

        linhas.slice(1).forEach(linha => {
            linha = linha.trim()
            if (!linha) return

            const colunas = linha.split(';')
            if (isNaN(Number(colunas[0]))) return

            // Números
            let numeros = colunas[4].trim() ? colunas[4].split(',').map(n => n.trim()).sort((a,b)=>a-b) : []
            if (numeros.length === 0) return // Ignora produtos sem numeração

            // Adiciona produto (nome e marca em maiúsculas)
            produtos.push({
                nome: colunas[1],
                marca: colunas[2],
                cor: colunas[3].split(',').map(c => c.trim()),
                numeros: numeros,
                categorias: colunas[5].split(',').map(c => c.trim()),
                imagem: colunas[6]
            })
        })

        salvar_produtos(produtos)
        alert('CSV importado com sucesso!')
        renderizar_produtos(produtos)
    }

    reader.readAsText(csv)
})

/*Localstorage*/
botao_localstorage.addEventListener('click', () => {
    const produtos_salvos = JSON.parse(localStorage.getItem('produtos')) || []
    renderizar_produtos(produtos_salvos)
})

botao_limpar.addEventListener('click', () => {
    if (confirm("Tem certeza que quer apagar?")) {
        localStorage.clear()
        cards_container.innerHTML = ''
        input_principal.value = ''
        produtos = []
    }
})

function salvar_produtos(produtos) {
    localStorage.setItem('produtos', JSON.stringify(produtos))
}

/*Renderizar*/
function renderizar_produtos(lista) {
    cards_container.innerHTML = ''

    lista.forEach(produto => {
        const card = document.createElement('div')
        card.classList.add('card')

        card.innerHTML = `
            <img class="imagem_card" src="${produto.imagem}" alt="${produto.nome}">
            <h3>${produto.nome.toUpperCase()}</h3>
            <p>Marca: ${produto.marca.toUpperCase()}</p>
            <p>Cor: ${produto.cor.join(', ')}</p>
            <p>Números: <span class="numeros">${produto.numeros.join(', ')}</span></p>
            <div class="botoes_do_card">
                <button class="botao botao_vender">Vender</button>
                <button class="botao botao_tirar">Tirar</button>
            </div>
        `

        const botaoVender = card.querySelector('.botao_vender')
        botaoVender.addEventListener('click', () => abrirModal(produto))

        cards_container.appendChild(card)
    })
}

/*Modal*/
function abrirModal(produto) {
    produtoAtual = produto
    numeroSelecionado = null

    preco_input.value = ''
    pagamento.value = ''
    campo_parcelas.classList.add('hidden')
    numeracoes_container.innerHTML = ''

    produto.numeros.forEach(num => {
        const el = document.createElement('div')
        el.classList.add('numero')
        el.textContent = num

        el.addEventListener('click', () => {

            if (numeroSelecionado === num) {
                el.classList.remove('selecionado')
                numeroSelecionado = null
                return
            }

            document.querySelectorAll('.numero')
                .forEach(n => n.classList.remove('selecionado'))

            el.classList.add('selecionado')
            numeroSelecionado = num
        })

        numeracoes_container.appendChild(el)
    })

    nome_modal.textContent = `Nome: ${produto.nome}`

    modal.classList.remove('hidden')
}

/*Pagamento*/
pagamento.addEventListener('change', () => {
    if (pagamento.value === 'credito') {
        campo_parcelas.classList.remove('hidden')
    } else {
        campo_parcelas.classList.add('hidden')
    }
})

/*Ações*/
cancelar_venda.addEventListener('click', () => {
    modal.classList.add('hidden')
})

confirmar_venda.addEventListener('click', () => {
    const preco = preco_input.value

    if (!numeroSelecionado || !preco || pagamento.value === '') {
        alert("Preencha todos os campos")
        return
    }

    // Produto vendido
    const produtoVendido = {
        nome: produtoAtual.nome.toLowerCase(),     // salva em minúsculo
        marca: produtoAtual.marca.toLowerCase(),   // salva em minúsculo
        cor: [...produtoAtual.cor],
        categorias: [...produtoAtual.categorias],
        imagem: produtoAtual.imagem,
        numero: numeroSelecionado,
        preco: Number(preco),
        pagamento: pagamento.value
    }

    // Salva parcelas somente se for crédito
    if (pagamento.value === 'credito') {
        produtoVendido.parcelas = document.getElementById('parcelas').value
    }

    // Salva em produtos_vendidos
    const vendidos = JSON.parse(localStorage.getItem('produtos_vendidos')) || []
    vendidos.push(produtoVendido)
    localStorage.setItem('produtos_vendidos', JSON.stringify(vendidos))

    // Remove número vendido e remove produto se ficar sem números
    produtos = produtos
        .map(p => {
            if (p.nome === produtoAtual.nome && p.imagem === produtoAtual.imagem) {
                return {
                    ...p,
                    numeros: p.numeros.filter(n => n.trim() !== numeroSelecionado)
                }
            }
            return p
        })
        .filter(p => p.numeros.length > 0)

    salvar_produtos(produtos)
    renderizar_produtos(produtos)
    modal.classList.add('hidden')
})


/*Dropdowns de Pesquisa*/
document.querySelectorAll('.filtro_pesquisa').forEach(container => {
    const input = container.querySelector('input')
    const valores = input.dataset.valores.split(',').map(v => v.trim())

    const dropdown = document.createElement('ul')
    dropdown.className = 'dropdown-pesquisa'
    container.appendChild(dropdown)

    function render(lista) {
        dropdown.innerHTML = ''
        lista.forEach(v => {
            const li = document.createElement('li')
            li.textContent = v
            li.onclick = () => {
                input.value = v
                dropdown.style.display = 'none'
            }
            dropdown.appendChild(li)
        })
        dropdown.style.display = lista.length ? 'block' : 'none'
    }

    input.addEventListener('focus', () => render(valores))
    input.addEventListener('input', () => {
        const t = input.value.toLowerCase()
        render(valores.filter(v => v.toLowerCase().includes(t)))
    })

    document.addEventListener('click', e => {
        if (!container.contains(e.target)) dropdown.style.display = 'none'
    })
})

document.getElementById("limpar_vendas").addEventListener('click', () => {
    localStorage.removeItem("produtos_vendidos")
})

document.getElementById("exportar_vendas").addEventListener('click', () => {
    // Pega apenas os produtos vendidos do localStorage
    const vendidos = JSON.parse(localStorage.getItem('produtos_vendidos')) || []

    if (vendidos.length === 0) {
        alert("Não há produtos vendidos para exportar!")
        return
    }

    // Cabeçalho do CSV
    const headers = ['Nome', 'Marca', 'Cor', 'Número', 'Categorias', 'Imagem', 'Preço', 'Pagamento', 'Parcelas']
    
    // Monta as linhas do CSV
    const linhas = vendidos.map(p => {
        return [
            p.nome,
            p.marca,
            p.cor.join(', '),
            p.numero,
            p.categorias.join(', '),
            p.imagem,
            p.preco,
            p.pagamento,
            p.parcelas || ''
        ].map(valor => `"${valor}"`).join(';')
    })

    // Adiciona BOM UTF-8 no início do CSV
    const csvContent = '\uFEFF' + [headers.join(';'), ...linhas].join('\n')

    // Data de hoje para o nome do arquivo (MM-DD)
    const hoje = new Date()
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const dia = String(hoje.getDate()).padStart(2, '0')
    const dataHoje = `${mes}-${dia}`

    // Cria link temporário para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `produtos_vendidos_(${dataHoje}).csv`
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
})
