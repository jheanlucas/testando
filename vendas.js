const cardsContainer = document.getElementById("cards_vendas")
const voltarBtn = document.getElementById("voltar")
const limparBtn = document.getElementById("limpar_vendas")
const inputVendas = document.getElementById("input_vendas")
const modalVendaManual = document.getElementById("modal_venda_manual")

/* ================== NAVEGAÇÃO ================== */
voltarBtn.addEventListener("click", () => {
  window.location.href = "index.html"
})

limparBtn.addEventListener("click", () => {
  if (confirm("Deseja realmente apagar todas as vendas?")) {
    localStorage.removeItem("produtos_vendidos")
    renderizarVendas([])
  }
})

/* ================== RENDER ================== */
function renderizarVendas(lista) {
  cardsContainer.innerHTML = ""

  if (!lista.length) {
    cardsContainer.innerHTML =
      `<p style="text-align:center;padding:20px;color:#555;">
        Nenhuma venda registrada.
      </p>`
    return
  }

  lista.forEach(produto => {
    const card = document.createElement("div")
    card.className = "card_venda"

    card.innerHTML = `
      <img class="imagem_card" src="${produto.imagem || 'sem-imagem.png'}">
      <div class="conteudo_card">
        <h3>${produto.nome.toUpperCase()}</h3>
        <p>Marca: <span>${produto.marca.toUpperCase()}</span></p>
        <p>Cor: <span>${produto.cor.join(", ")}</span></p>
        <p>Número: <span>${produto.numero}</span></p>
        <p>Preço: <span>R$ ${Number(produto.preco || 0).toFixed(2)}</span></p>
        <p>Pagamento: <span>${produto.pagamento}</span></p>
        ${
          produto.pagamento === "credito" && produto.parcelas
            ? `<p>Parcelas: <span>${produto.parcelas}x</span></p>`
            : ""
        }
      </div>
    `
    cardsContainer.appendChild(card)
  })
}

/* ================== CSV INPUT ================== */
inputVendas.addEventListener("change", () => {
  const file = inputVendas.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = e => {
    const linhas = e.target.result.split("\n")

    const vendas = linhas.slice(1).map(linha => {
      linha = linha.trim()
      if (!linha) return null

      const col = linha.split(";")
      if (col.length < 7) return null

      // Preço
      let preco = col[6]
        ?.replace("R$", "")
        .replace(".", "")
        .replace(",", ".")
        .trim()
      preco = Number(preco)
      if (isNaN(preco)) preco = 0

      // Parcelas
      let parcelas = col[8]
        ? col[8].replace("x", "").trim()
        : ""

      return {
        id: col[0]?.trim() || "",           // << adiciona o ID do CSV
        nome: col[1]?.toLowerCase() || "",
        marca: col[2]?.toLowerCase() || "",
        cor: col[3]?.split(",").map(c => c.trim()) || [],
        numero: col[4] || "",
        categorias: col[5]?.split(",").map(c => c.trim()) || [],
        imagem: col[6] || "sem-imagem.png",
        preco,
        pagamento: col[7] || "",
        parcelas
      }
    }).filter(Boolean)

    // Salva no localStorage sem sobrescrever histórico
    const vendidosExistentes = JSON.parse(localStorage.getItem("produtos_vendidos")) || []
    const todosVendas = [...vendidosExistentes, ...vendas]
    localStorage.setItem("produtos_vendidos", JSON.stringify(todosVendas))

    renderizarVendas(todosVendas)
  }

  reader.readAsText(file, "UTF-8")
})


/* ================== LOAD LOCALSTORAGE ================== */
const vendidosLS = JSON.parse(localStorage.getItem("produtos_vendidos")) || []
renderizarVendas(vendidosLS)

/* ================== MODAL ================== */
document.getElementById("adicionar_venda").onclick = () =>
  modalVendaManual.classList.remove("hidden")

document.getElementById("cancelar_venda_manual").onclick = () =>
  modalVendaManual.classList.add("hidden")

document.getElementById("v_pagamento").addEventListener("change", e => {
  document
    .getElementById("v_campo_parcelas")
    .classList.toggle("hidden", e.target.value !== "credito")
})

/* ================== AUTOCOMPLETE ================== */
document.querySelectorAll(".filtro_pesquisa").forEach(container => {
  const input = container.querySelector("input")
  if (!input?.dataset.valores) return

  const valores = input.dataset.valores.split(",").map(v => v.trim())
  const dropdown = document.createElement("ul")
  dropdown.className = "dropdown-pesquisa"
  container.appendChild(dropdown)

  function render(lista) {
    dropdown.innerHTML = ""
    lista.forEach(v => {
      const li = document.createElement("li")
      li.textContent = v
      li.onclick = () => {
        input.value = v
        dropdown.style.display = "none"
      }
      dropdown.appendChild(li)
    })
    dropdown.style.display = lista.length ? "block" : "none"
  }

  input.onfocus = () => render(valores)
  input.oninput = () =>
    render(valores.filter(v => v.toLowerCase().includes(input.value.toLowerCase())))

  document.addEventListener("click", e => {
    if (!container.contains(e.target)) dropdown.style.display = "none"
  })
})
const confirmarVendaManualBtn = document.getElementById("confirmar_venda_manual");

// Cria um set para categorias do modal
const categoriasSelecionadas = new Set();
document.querySelectorAll("#v_categorias .cat").forEach(cat => {
  cat.onclick = () => {
    cat.classList.toggle("ativa");
    categoriasSelecionadas.has(cat.textContent)
      ? categoriasSelecionadas.delete(cat.textContent)
      : categoriasSelecionadas.add(cat.textContent);
  };
});

confirmarVendaManualBtn.addEventListener("click", () => {
  const nome = document.getElementById("v_nome").value.trim();
  const marca = document.getElementById("v_marca").value.trim();
  const cor = document.getElementById("v_cor").value.trim();
  const numero = document.getElementById("v_numero").value;
  const preco = document.getElementById("v_preco").value;
  const pagamento = document.getElementById("v_pagamento").value;
  const parcelas = document.getElementById("v_parcelas")?.value || "";

  if (!nome || !marca || !cor || !numero || !preco || !pagamento) {
    alert("Preencha todos os campos");
    return;
  }

  const produtoVendido = {
    id: Date.now(), // gera ID único
    nome: nome.toLowerCase(),
    marca: marca.toLowerCase(),
    cor: cor.split(",").map(c => c.trim()),
    categorias: Array.from(categoriasSelecionadas),
    imagem: "sem-imagem.png", // pode mudar se quiser colocar imagem no modal
    numero,
    preco: Number(preco),
    pagamento,
    parcelas: pagamento === "credito" ? parcelas : ""
  };

  const vendidosExistentes = JSON.parse(localStorage.getItem("produtos_vendidos")) || [];
  vendidosExistentes.push(produtoVendido);
  localStorage.setItem("produtos_vendidos", JSON.stringify(vendidosExistentes));

  renderizarVendas(vendidosExistentes);
  modalVendaManual.classList.add("hidden");

  // Limpa campos do modal
  document.getElementById("v_nome").value = "";
  document.getElementById("v_marca").value = "";
  document.getElementById("v_cor").value = "";
  document.getElementById("v_numero").value = "";
  document.getElementById("v_preco").value = "";
  document.getElementById("v_pagamento").value = "";
  document.getElementById("v_parcelas").value = "";
  categoriasSelecionadas.clear();
  document.querySelectorAll("#v_categorias .cat").forEach(cat => cat.classList.remove("ativa"));
});



