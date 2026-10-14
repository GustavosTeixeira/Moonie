const lista = document.querySelector(".reading-books");

// Usuário que fez login e a lista de leitura dele
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
const chave = usuario ? "leitura_" + usuario.email : null;
const chaveFavoritos = usuario ? "favoritos_" + usuario.email : null;
let livros = usuario ? (JSON.parse(localStorage.getItem(chave)) || []) : [];


// FAVORITOS DO USUÁRIO (mesma lista usada na página do livro e no perfil)
function lerFavoritos() {
    return usuario ? (JSON.parse(localStorage.getItem(chaveFavoritos)) || []) : [];
}

function estaFavoritado(titulo) {
    return lerFavoritos().some(function (item) {
        return item.titulo === titulo;
    });
}

function alternarFavorito(livro) {
    const favoritos = lerFavoritos();

    if (estaFavoritado(livro.titulo)) {
        const novaLista = favoritos.filter(function (item) {
            return item.titulo !== livro.titulo;
        });
        localStorage.setItem(chaveFavoritos, JSON.stringify(novaLista));
    } else {
        favoritos.push(livro);
        localStorage.setItem(chaveFavoritos, JSON.stringify(favoritos));
    }
}


function mostrarLivros() {

    // NÃO ESTÁ LOGADO
    if (!usuario) {
        lista.innerHTML = `
            <p class="empty-reading">
                Faça <a href="login.html">login</a> para ver a sua lista de leitura.
            </p>
        `;
        return;
    }

    // LISTA VAZIA
    if (livros.length === 0) {
        lista.innerHTML = `
            <p class="empty-reading">
                Você ainda não adicionou nenhum livro à sua lista.
            </p>
        `;
        return;
    }

    lista.innerHTML = "";

    livros.forEach(function (livro, index) {

        lista.innerHTML += `
            <article class="reading-book">
                <div class="reading-cover">
                    <span>${livro.titulo}</span>
                </div>

                <div class="reading-info">
                    <p>${livro.categoria}</p>
                    <h2>${livro.titulo}</h2>

                    <a href="leitura.html" data-acao="continuar" data-index="${index}">
                        Continuar →
                    </a>

                    <button
                        class="remove-reading favorite-reading"
                        data-acao="favoritar"
                        data-index="${index}"
                        type="button"
                    >
                        ${estaFavoritado(livro.titulo) ? "♥ Favoritado" : "♡ Favoritar"}
                    </button>

                    <button
                        class="remove-reading"
                        data-acao="remover"
                        data-index="${index}"
                        type="button"
                    >
                        Remover
                    </button>
                </div>
            </article>
        `;
    });

    // LINKS CONTINUAR: guardam o livro escolhido para a página de leitura abrir o certo
    const linksContinuar = document.querySelectorAll('[data-acao="continuar"]');

    linksContinuar.forEach(function (link) {
        link.addEventListener("click", function () {
            const index = Number(link.dataset.index);

            localStorage.setItem("obraAtual", JSON.stringify(livros[index]));
        });
    });

    // BOTÕES FAVORITAR
    const botoesFavoritar = document.querySelectorAll('[data-acao="favoritar"]');

    botoesFavoritar.forEach(function (botao) {
        botao.addEventListener("click", function () {
            const index = Number(botao.dataset.index);

            alternarFavorito(livros[index]);

            mostrarLivros();
        });
    });

    // BOTÕES REMOVER
    const botoesRemover = document.querySelectorAll('[data-acao="remover"]');

    botoesRemover.forEach(function (botao) {
        botao.addEventListener("click", function () {
            const index = Number(botao.dataset.index);

            livros.splice(index, 1);
            localStorage.setItem(chave, JSON.stringify(livros));

            mostrarLivros();
        });
    });
}

mostrarLivros();