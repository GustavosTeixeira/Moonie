// ======================================================
// MOONIE - BIBLIOTECA
// ======================================================

// ====================
// BUSCA DE LIVROS
// ====================

const campoBusca = document.querySelector("#search");
const livros = document.querySelectorAll(".library-book");

if (campoBusca) {

    campoBusca.addEventListener("input", function () {

        const pesquisa = campoBusca.value.toLowerCase().trim();

        livros.forEach(function (livro) {

            const textoLivro = livro.textContent.toLowerCase();

            if (textoLivro.includes(pesquisa)) {
                livro.style.display = "";
            } else {
                livro.style.display = "none";
            }

        });

    });

}


// ====================
// FILTRO POR CATEGORIA
// ====================

const categorias = document.querySelectorAll(".categories a");

categorias.forEach(function (categoria) {

    categoria.addEventListener("click", function (event) {

        event.preventDefault();

        const categoriaEscolhida = categoria
            .textContent
            .toLowerCase()
            .trim();

        livros.forEach(function (livro) {

            const categoriaLivro = livro
                .querySelector(".library-info p")
                ?.textContent
                .toLowerCase()
                .trim();

            if (categoriaEscolhida === categoriaLivro) {
                livro.style.display = "";
            } else {
                livro.style.display = "none";
            }

        });

        // Vai para a seção da categoria
        const destino = document.querySelector(
            categoria.getAttribute("href")
        );

        if (destino) {
            destino.scrollIntoView({
                behavior: "smooth"
            });
        }

    });

});

// ====================
// FAVORITAR LIVRO
// ====================

const botaoFavorito = document.querySelector("#btn-favorite");

if (botaoFavorito) {

    const livroFavorito = "o-morro-dos-ventos-uivantes";

    let favoritos = JSON.parse(
        localStorage.getItem("moonnieFavoritos")
    ) || [];

    // Verifica se o livro já está favoritado
    if (favoritos.includes(livroFavorito)) {
        botaoFavorito.textContent = "♥ Favoritado";
        botaoFavorito.classList.add("favoritado");
    }

    botaoFavorito.addEventListener("click", function () {

        if (favoritos.includes(livroFavorito)) {

            // Remove dos favoritos
            favoritos = favoritos.filter(
                function (livro) {
                    return livro !== livroFavorito;
                }
            );

            botaoFavorito.textContent = "♡ Favoritar";
            botaoFavorito.classList.remove("favoritado");

        } else {

            // Adiciona aos favoritos
            favoritos.push(livroFavorito);

            botaoFavorito.textContent = "♥ Favoritado";
            botaoFavorito.classList.add("favoritado");
        }

        localStorage.setItem(
            "moonnieFavoritos",
            JSON.stringify(favoritos)
        );

    });

}

// ====================
// QUERO LER
// ====================

const botaoLeitura = document.querySelector("#btn-reading");

if (botaoLeitura) {

    const livroLeitura = "o-morro-dos-ventos-uivantes";

    let livrosParaLer = JSON.parse(
        localStorage.getItem("moonnieLeitura")
    ) || [];

    // Verifica se já está na lista
    if (livrosParaLer.includes(livroLeitura)) {
        botaoLeitura.textContent = "✓ Na minha leitura";
        botaoLeitura.classList.add("adicionado");
    }

    botaoLeitura.addEventListener("click", function () {

        if (livrosParaLer.includes(livroLeitura)) {

            // Remove da lista
            livrosParaLer = livrosParaLer.filter(
                function (livro) {
                    return livro !== livroLeitura;
                }
            );

            botaoLeitura.textContent = "Quero ler";
            botaoLeitura.classList.remove("adicionado");

        } else {

            // Adiciona à lista
            livrosParaLer.push(livroLeitura);

            botaoLeitura.textContent = "✓ Na minha leitura";
            botaoLeitura.classList.add("adicionado");
        }

        localStorage.setItem(
            "moonnieLeitura",
            JSON.stringify(livrosParaLer)
        );

    });

}

const botoesEventos = document.querySelectorAll(".event-button");

botoesEventos.forEach(function(botao) {
    botao.addEventListener("click", function(event) {
        event.preventDefault();

        alert("Sua participação foi registrada! 🌙\nEm breve você receberá mais informações sobre o evento.");
    });
});