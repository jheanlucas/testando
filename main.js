const input_principal = document.getElementById("input_csv")
const cards_container = document.getElementById("cards")
const preco_da_venda = document.getElementById("preco")
const forma_de_pagamento = document.getElementById("pagamento")
const qtd_de_parcelas = document.getElementById('parcelas')
const campo_de_parcelas = document.getElementById("campo_de_parcelas")
const numeracoes_container = document.getElementById("numeracoes_container")
const nome_do_produto = document.getElementById("nome_do_produto")
const nome_do_produto_de_tirar = document.getElementById("nome_do_produto_de_tirar")
const modal_completo = document.getElementById("modal_de_venda")
const cancelar_venda = document.getElementById("cancelar_venda")
const botao_mostrar_estoque = document.getElementById("estoque_local")
const botao_limpar_estoque = document.getElementById("limpar_estoque")
const botao_de_vender = document.getElementById("confirmar_venda")
const botao_limpar_vendas = document.getElementById("limpar_vendas")
const botao_exportar_vendas = document.getElementById("exportar_vendas")
const botao_exportar_estoque = document.getElementById("exportar_estoque")
const modal_de_tirar = document.getElementById("modal_de_tirar_produto")
const cancelar_exclusao = document.getElementById("cancelar_exclusao")
const numeracoes_container_de_tirar = document.getElementById("numeracoes_container_de_tirar")
const botao_excluir_produto = document.getElementById("excluir_produto")
const modal_de_adicionar_numeracao = document.getElementById("modal_de_adicionar_numeracao")
const botao_de_cancelar_adicao = document.getElementById("cancelar_adicao_de_numeracao")
const botao_de_confirmar_adicao_de_numeracao = document.getElementById("adicionar_numeracao")

let produtos = []
let produtoAtual = null
let numeroSelecionado = null

/*Leitura do CSV*/
input_principal.addEventListener('change', () => {
    //adiciona o csv a uma variavel
    const csv = input_principal.files[0]
    if (!csv) return

    //Lê o csv aqui
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

            //verifica se as numerações existem e ordena elas
            let numeracoes = colunas[4].trim() ? colunas[4].split(',').map(n => Number(n.trim())).sort((a,b)=>a-b) : []
            //ignora produtos sem numeração
            if (numeracoes.length === 0) return

            //adiciona o produto
            produtos.push({
                id: colunas[0],
                nome: colunas[1],
                marca: colunas[2],
                cor: colunas[3].split(',').map(cor => cor.trim()),
                numeros: numeracoes,
                categorias: colunas[5].split(',').map(c => c.trim()),
                imagem: colunas[6]
            })
        })

        salvar_produtos(produtos)
        alert('CSV importado com sucesso!')
        renderizar_produtos(produtos)
    }

    reader.onerror = () => {
        alert("Erro ao ler o arquivo!")
    }

    reader.readAsText(csv)
})
//Salva os produtos no localstorage
function salvar_produtos(produtos) {
    localStorage.setItem('produtos', JSON.stringify(produtos))
}
//renderiza os produtos (fazer filtros!)
function renderizar_produtos(produtos) {
    cards_container.innerHTML = ''

    produtos.forEach(produto => {
        const card = document.createElement('div')
        card.classList.add('card')

        if (produto.numeros.length === 0) return

        card.innerHTML = `
            <img class="imagem_card" src="${produto.imagem}" alt="${produto.nome}">
            <h3>${produto.nome.toUpperCase()}</h3>
            <p>Marca: <span class="destaque">${produto.marca.toUpperCase()}</span></p>
            <p>Cor: ${produto.cor.join(', ')}</p>
            <p>Números: <span class="destaque">${produto.numeros.join(', ')}</span></p>
            <div class="botoes_do_card">
                <button class="botao botao_vender">Vender</button>
                <button class="botao botao_tirar">Tirar</button>
                <button class="botao botao_adicionar_numeracao">Adicionar</button>
            </div>
        `

        const botao_de_vender = card.querySelector('.botao_vender')
        const botao_de_tirar = card.querySelector('.botao_tirar')
        const botao_de_adicionar_numeracao = card.querySelector('.botao_adicionar_numeracao')

        botao_de_vender.addEventListener('click', () => abrirModal(produto))
        botao_de_tirar.addEventListener('click', () => tirar_produto(produto))
        botao_de_adicionar_numeracao.addEventListener('click', () => adicionar_numeracao(produto))

        cards_container.appendChild(card)
    })
}
//Aqui abre o modal
function abrirModal(produto) {
    produtoAtual = produto
    numeroSelecionado = null


    modal_completo.classList.remove('hidden')
    modal_completo.setAttribute('aria-hidden', 'false')
    modal_completo.setAttribute('aria-modal', 'true')
    nome_do_produto.innerHTML = `Nome: <span style="font-weight: bold;">${produto.nome.toUpperCase()}</span>`
    preco_da_venda.value = ''
    forma_de_pagamento.value = ''
    campo_de_parcelas.classList.add('hidden')
    numeracoes_container.innerHTML = ''

    produto.numeros.forEach(numeracao => {
        const div_numeracao = document.createElement('div')
        div_numeracao.classList.add('numero')
        div_numeracao.textContent = `${numeracao}`

        //verifica se clicou em uma numeração e se clicou ele desabilita o selecionado de todos e adiciona somente no do produto
        div_numeracao.addEventListener('click', () => {
            if (numeroSelecionado === numeracao) {
                div_numeracao.classList.remove('selecionado')
                numeroSelecionado = null
                return
            }

            numeracoes_container.querySelectorAll('.numero').forEach(div_numero => div_numero.classList.remove('selecionado'))

            div_numeracao.classList.add('selecionado')
            numeroSelecionado = numeracao
        })

        numeracoes_container.appendChild(div_numeracao)
    })

    modal_completo.classList.remove('hidden')
}
//Aqui fecha o modal
cancelar_venda.addEventListener('click', () => {
    modal_completo.classList.add('hidden')
    modal_completo.setAttribute('aria-hidden', 'true')
    modal_completo.removeAttribute('aria-modal')
})
//Aqui mostra o estoque do localstorage por meio do botao
botao_mostrar_estoque.addEventListener('click', () => {
    const produtos_salvos = JSON.parse(localStorage.getItem('produtos')) || []
    renderizar_produtos(produtos_salvos)
})
//Aqui limpa o estoque do localstorage
botao_limpar_estoque.addEventListener('click', () => {
    if (confirm("Tem certeza que quer apagar?")) {
        localStorage.removeItem('produtos')
        cards_container.innerHTML = ''
        input_principal.value = ''
        produtos = []
    }
})
//Verifica se o pagamento é credito e mostra as parcelas para escolher
forma_de_pagamento.addEventListener('change', () => {
    if (forma_de_pagamento.value === 'credito') {
        campo_de_parcelas.classList.remove('hidden')
    } else {
        campo_de_parcelas.classList.add('hidden')
    }
})
//Aqui envia a venda para o localstorage
botao_de_vender.addEventListener("click", () => {

    if (!numeroSelecionado) {
        alert("Selecione uma numeração!")
        return
    }

    const preco = preco_da_venda.value
    const forma_pagamento = forma_de_pagamento.value
    const parcelas = qtd_de_parcelas.value || ""

    if (!preco || !forma_pagamento) {
        alert("Preencha todos os campos")
        return
    }

    const produtoVendido = {
        id: produtoAtual.id,
        nome: produtoAtual.nome,
        marca: produtoAtual.marca,
        cor: produtoAtual.cor,
        numero: numeroSelecionado,
        categorias: produtoAtual.categorias,
        imagem: produtoAtual.imagem || "sem-imagem.png",
        preco: Number(preco),
        pagamento: forma_pagamento,
        parcelas: forma_pagamento === "credito" ? parcelas : ""
    }
    
    const novas_numeracoes = produtoAtual.numeros.filter(numero => numero != numeroSelecionado)
    produtoAtual.numeros = novas_numeracoes
    let produtos_salvos = JSON.parse(localStorage.getItem("produtos")) || []

    produtos_salvos = produtos_salvos.map(produto => {
        if (produto.id === produtoAtual.id) {
            return { ...produto, numeros: novas_numeracoes }
        }
        return produto
    })
    salvar_produtos(produtos_salvos)
    renderizar_produtos(produtos_salvos)

    const vendidos_existentes = JSON.parse(localStorage.getItem("produtos_vendidos")) || []
    vendidos_existentes.push(produtoVendido)
    localStorage.setItem("produtos_vendidos", JSON.stringify(vendidos_existentes))

    modal_completo.classList.add("hidden")
})
//Exportar vendas em csv para o usuario
botao_exportar_vendas.addEventListener('click', () => {
    // Pega apenas os produtos vendidos do localStorage
    const vendidos = JSON.parse(localStorage.getItem('produtos_vendidos')) || []

    if (vendidos.length === 0) {
        alert("Não há produtos vendidos para exportar!")
        return
    }

    // Cabeçalho do CSV
    const headers = ['Id','Nome', 'Marca', 'Cor', 'Número', 'Categorias', 'Imagem', 'Preço', 'Pagamento', 'Parcelas']
    
    // Monta as linhas do CSV
    const linhas = vendidos.map(produto => {
        return [
            produto.id,
            produto.nome,
            produto.marca,
            produto.cor.join(', '),
            produto.numero,
            produto.categorias.join(', '),
            produto.imagem,
            produto.preco,
            produto.pagamento,
            produto.parcelas || ''
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
//Exportar estoque de produtos em csv para o usuario
botao_exportar_estoque.addEventListener('click', () => {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || []

    if (produtos.length === 0) {
        alert("Não há produtos no estoque para exportar!")
        return
    }

    //cabeçalho do CSV
    const headers = ['Id','Nome', 'Marca', 'Cor', 'Número', 'Categorias', 'Imagem']
    
    // Monta as linhas do CSV
    const linhas = produtos.map(produto => {
        return [
            produto.id ?? '',
            produto.nome ?? '',
            produto.marca ?? '',
            produto.cor?.join(', ') ?? '',
            produto.numeros?.join(', ') ?? '',
            produto.categorias?.join(', ') ?? '',
            produto.imagem ?? ''
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
    a.download = `estoque_de_produtos_(${dataHoje}).csv`
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
})
//dropdown para on filtros de marca e cor
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
//função de tirar produto
function tirar_produto(produto) {
    produtoAtual = produto
    numeroSelecionado = null

    modal_de_tirar.setAttribute('aria-hidden', 'false')
    modal_de_tirar.setAttribute('aria-modal', 'true')
    nome_do_produto_de_tirar.innerHTML = `Nome: <span style="font-weight: bold;">${produto.nome.toUpperCase()}</span>`

    numeracoes_container_de_tirar.innerHTML = ''

    produto.numeros.forEach(numeracao => {
        const div_numeracao = document.createElement('div')
        div_numeracao.classList.add('numero')
        div_numeracao.textContent = `${numeracao}`

        //verifica se clicou em uma numeração e se clicou ele desabilita o selecionado de todos e adiciona somente no do produto
        div_numeracao.addEventListener('click', () => {
            if (numeroSelecionado === numeracao) {
                div_numeracao.classList.remove('selecionado')
                numeroSelecionado = null
                return
            }

            numeracoes_container_de_tirar.querySelectorAll('.numero').forEach(div_numero => div_numero.classList.remove('selecionado'))

            div_numeracao.classList.add('selecionado')
            numeroSelecionado = numeracao
        })

        numeracoes_container_de_tirar.appendChild(div_numeracao)
    })

    modal_de_tirar.classList.remove('hidden')
}
//Confirmar a exclusão do produto
botao_excluir_produto.addEventListener('click', () => {

    if(!numeroSelecionado) {
        alert("Escolha uma numeração!")
        return
    }
    
    const novas_numeracoes = produtoAtual.numeros.filter(numero => numero != numeroSelecionado)
    produtoAtual.numeros = novas_numeracoes
    let produtos_salvos = JSON.parse(localStorage.getItem("produtos")) || []

    produtos_salvos = produtos_salvos.map(produto => {
        if (produto.id === produtoAtual.id) {
            return { ...produto, numeros: novas_numeracoes }
        }
        return produto
    })
    salvar_produtos(produtos_salvos)
    renderizar_produtos(produtos_salvos)
    modal_de_tirar.classList.add('hidden')
})
//Cancela a exclusão do produto
cancelar_exclusao.addEventListener('click', () => {
    modal_de_tirar.classList.add('hidden')
    modal_de_tirar.setAttribute('aria-hidden', 'true')
    modal_de_tirar.removeAttribute('aria-modal')
})
//função de adicionar numeração ao produto
function adicionar_numeracao(produto) {
    produtoAtual = produto
    numeroSelecionado = null

    modal_de_adicionar_numeracao.setAttribute('aria-hidden', 'false')
    modal_de_adicionar_numeracao.setAttribute('aria-modal', 'true')
    document.getElementById("nome_do_produto_de_adiconar_numeracao").innerHTML = `Nome: <span style="font-weight: bold;">${produto.nome.toUpperCase()}</span>`
    const numeracoes_container_de_adicionar_numeracao = document.getElementById("numeracoes_container_de_adicionar_numeracao")
    
    numeracoes_container_de_adicionar_numeracao.innerHTML = ''
    const numeracoes = [18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45]

    numeracoes.forEach(numeracao => {
        const div_numeracao = document.createElement('div')
        div_numeracao.classList.add('numero')
        div_numeracao.textContent = `${numeracao}`

        //verifica se clicou em uma numeração e se clicou ele desabilita o selecionado de todos e adiciona somente no do produto
        div_numeracao.addEventListener('click', () => {
            if (numeroSelecionado === numeracao) {
                div_numeracao.classList.remove('selecionado')
                numeroSelecionado = null
                return
            }

            numeracoes_container_de_adicionar_numeracao.querySelectorAll('.numero').forEach(div_numero => div_numero.classList.remove('selecionado'))

            div_numeracao.classList.add('selecionado')
            numeroSelecionado = numeracao
        })

        numeracoes_container_de_adicionar_numeracao.appendChild(div_numeracao)
    })

    modal_de_adicionar_numeracao.classList.remove('hidden')
}
//Aqui confirma a adicao da numeracao
botao_de_confirmar_adicao_de_numeracao.addEventListener('click', () => {

    if(!numeroSelecionado) {
        alert("Escolha uma numeração!")
        return
    }
    
    produtoAtual.numeros.push(numeroSelecionado)
    produtoAtual.numeros.sort((a, b) => a - b)
    const novas_numeracoes = produtoAtual.numeros

    let produtos_salvos = JSON.parse(localStorage.getItem("produtos")) || []
    produtos_salvos = produtos_salvos.map(produto => {
        if (produto.id === produtoAtual.id) {
            return { ...produto, numeros: novas_numeracoes }
        }
        return produto
    })

    salvar_produtos(produtos_salvos)
    renderizar_produtos(produtos_salvos)
    modal_de_adicionar_numeracao.classList.add('hidden')
})
//Aqui cancela a adição de uma numeração
botao_de_cancelar_adicao.addEventListener('click', () => {
    modal_de_adicionar_numeracao.classList.add('hidden')
    modal_de_adicionar_numeracao.setAttribute('aria-hidden', 'true')
    modal_de_adicionar_numeracao.removeAttribute('aria-modal')
})