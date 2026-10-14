document.addEventListener("DOMContentLoaded", () => {
    /* ==========================================================================
       1. VERIFICAÇÃO DE SESSÃO E DADOS DO USUÁRIO
       ========================================================================== */
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado) {
        alert("Você precisa estar logado para acessar seu perfil!");
        window.location.href = "login.html";
        return;
    }

    const avatarEl = document.querySelector(".profile-avatar");
    const tituloPerfil = document.querySelector(".profile-info h1");

    if (avatarEl && usuarioLogado.nome) {
        avatarEl.textContent = usuarioLogado.nome.charAt(0).toUpperCase();
    }

    if (tituloPerfil && usuarioLogado.nome) {
        tituloPerfil.textContent = `Olá, ${usuarioLogado.nome}!`;
    }

    /* ==========================================================================
       FAVORITOS DOS LIVROS DA BIBLIOTECA (lista do usuário logado)
       Os livros favoritados na página do livro ficam em "favoritos_email"
       ========================================================================== */
    const chaveFavoritosLivros = "favoritos_" + usuarioLogado.email;

    function lerFavoritosLivros() {
        return JSON.parse(localStorage.getItem(chaveFavoritosLivros)) || [];
    }

    /* ==========================================================================
       2. AÇÃO DE LOGOUT
       ========================================================================== */
    const linksSair = document.querySelectorAll('a[href="login.html"]');
    linksSair.forEach((link) => {
        if (link.textContent.toLowerCase().includes("sair")) {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("usuarioLogado");
                window.location.href = "login.html";
            });
        }
    });

    /* ==========================================================================
       3. CONTADORES DO PERFIL
       ========================================================================== */
    function atualizarContadores() {
        const obrasCriadas = JSON.parse(localStorage.getItem("obrasMoonie")) || [];
        const contadorHistorias = document.querySelectorAll(".profile-stat strong")[1];

        // Histórias salvas = histórias criadas + livros favoritados
        if (contadorHistorias) {
            contadorHistorias.textContent = obrasCriadas.length + lerFavoritosLivros().length;
        }

        const contadorLivrosLidos = document.querySelectorAll(".profile-stat strong")[0];
        // Livros lidos = histórias criadas concluídas + livros da biblioteca marcados como lidos
        const livrosConcluidos =
            obrasCriadas.filter(obra => obra.concluido).length +
            lerFavoritosLivros().filter(livro => livro.concluido).length;
        if (contadorLivrosLidos) {
            contadorLivrosLidos.textContent = livrosConcluidos;
        }

        const contadorTempo = document.querySelectorAll(".profile-stat strong")[2];
        const tempoSalvo = Number(localStorage.getItem("tempoLeitura")) || 0;
        const horas = Math.floor(tempoSalvo / 3600);
        const minutos = Math.floor((tempoSalvo % 3600) / 60);

        if (contadorTempo) {
            contadorTempo.textContent = horas > 0 ? `${horas}h` : (minutos > 0 ? `${minutos}min` : "0h");
        }
    }

    /* ==========================================================================
       4. MINHA BIBLIOTECA (AÇÕES: LER, FAVORITAR, CONCLUIR, EXCLUIR)
       ========================================================================== */
    function renderizarBiblioteca() {
        const bibliotecaContainer = document.querySelector(".profile-section");
        const emptyState = document.querySelector(".profile-empty");
        const obras = JSON.parse(localStorage.getItem("obrasMoonie")) || [];

        const favoritosLivros = lerFavoritosLivros();

        atualizarContadores();

        if (!bibliotecaContainer) return;

        // Se não houver obras nem livros favoritados, mostra a mensagem padrão
        if (obras.length === 0 && favoritosLivros.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            const gridExistente = document.getElementById("obras-grid");
            if (gridExistente) gridExistente.remove();
            return;
        }

        if (emptyState) emptyState.style.display = "none";

        let gridObras = document.getElementById("obras-grid");
        if (!gridObras) {
            gridObras = document.createElement("div");
            gridObras.id = "obras-grid";
            gridObras.className = "profile-library-books";
            bibliotecaContainer.appendChild(gridObras);
        }

        const cartoesObras = obras.map((obra, index) => `
            <article class="profile-library-book" data-index="${index}">
                <div class="profile-library-cover">
                    <span>${obra.titulo}</span>
                    ${obra.concluido ? '<span class="badge-concluido">✓ LIDO</span>' : ''}
                </div>

                <div class="profile-library-info">
                    <p>${obra.genero || 'História'}</p>
                    <h3>${obra.titulo}</h3>
                    <span>${obra.autor}</span>

                    <div class="card-actions">
                        <button class="btn-card btn-read" onclick="abrirLeitura(${index})">📖 Ler</button>
                        <button class="btn-card btn-fav" onclick="alternarFavorito(${index})">
                            ${obra.favorito ? '⭐ Favoritado' : '☆ Favoritar'}
                        </button>
                        <button class="btn-card btn-done" onclick="alternarConcluido(${index})">
                            ${obra.concluido ? '✓ Concluído' : '◯ Marcar lido'}
                        </button>
                        <button class="btn-card btn-delete" onclick="excluirObra(${index})">🗑 Excluir</button>
                    </div>
                </div>
            </article>
        `).join("");

        // Livros da biblioteca que o usuário favoritou
        const cartoesFavoritosLivros = favoritosLivros.map((livro, index) => `
            <article class="profile-library-book">
                <div class="profile-library-cover">
                    <span>${livro.titulo}</span>
                    ${livro.concluido ? '<span class="badge-concluido">✓ LIDO</span>' : ''}
                </div>

                <div class="profile-library-info">
                    <p>${livro.categoria || 'Livro'}</p>
                    <h3>${livro.titulo}</h3>
                    <span>${livro.autor}</span>

                    <div class="card-actions">
                        <button class="btn-card btn-read" onclick="abrirLeituraLivro(${index})">📖 Ler</button>
                        <button class="btn-card btn-done" onclick="alternarConcluidoLivro(${index})">
                            ${livro.concluido ? '✓ Concluído' : '◯ Marcar lido'}
                        </button>
                        <button class="btn-card btn-delete" onclick="removerFavoritoLivro(${index})">🗑 Remover</button>
                    </div>
                </div>
            </article>
        `).join("");

        gridObras.innerHTML = cartoesObras + cartoesFavoritosLivros;
    }

    /* ==========================================================================
       5. FUNÇÕES DE AÇÃO GLOBAL
       ========================================================================== */
    window.abrirLeitura = function(index) {
        const obras = JSON.parse(localStorage.getItem("obrasMoonie")) || [];
        if (obras[index]) {
            localStorage.setItem("obraAtual", JSON.stringify(obras[index]));
            window.location.href = "leitura.html";
        }
    };

    window.alternarFavorito = function(index) {
        const obras = JSON.parse(localStorage.getItem("obrasMoonie")) || [];
        if (obras[index]) {
            obras[index].favorito = !obras[index].favorito;
            localStorage.setItem("obrasMoonie", JSON.stringify(obras));
            renderizarBiblioteca();
            mostrarFavoritos();
        }
    };

    window.alternarConcluido = function(index) {
        const obras = JSON.parse(localStorage.getItem("obrasMoonie")) || [];
        if (obras[index]) {
            obras[index].concluido = !obras[index].concluido;
            localStorage.setItem("obrasMoonie", JSON.stringify(obras));
            renderizarBiblioteca();
        }
    };

    window.excluirObra = function(index) {
        if (confirm("Tem certeza que deseja excluir esta história?")) {
            const obras = JSON.parse(localStorage.getItem("obrasMoonie")) || [];
            obras.splice(index, 1);
            localStorage.setItem("obrasMoonie", JSON.stringify(obras));
            renderizarBiblioteca();
            mostrarFavoritos();
        }
    };

    // Abre a página de leitura com o livro da biblioteca escolhido
    window.abrirLeituraLivro = function(index) {
        const favoritosLivros = lerFavoritosLivros();
        if (favoritosLivros[index]) {
            localStorage.setItem("obraAtual", JSON.stringify(favoritosLivros[index]));
            window.location.href = "leitura.html";
        }
    };

    // Marca ou desmarca um livro da biblioteca como lido
    window.alternarConcluidoLivro = function(index) {
        const favoritosLivros = lerFavoritosLivros();
        if (favoritosLivros[index]) {
            favoritosLivros[index].concluido = !favoritosLivros[index].concluido;
            localStorage.setItem(chaveFavoritosLivros, JSON.stringify(favoritosLivros));
            renderizarBiblioteca();
        }
    };

    // Remove um livro da biblioteca da lista de favoritos
    window.removerFavoritoLivro = function(index) {
        const favoritosLivros = lerFavoritosLivros();
        favoritosLivros.splice(index, 1);
        localStorage.setItem(chaveFavoritosLivros, JSON.stringify(favoritosLivros));
        renderizarBiblioteca();
        mostrarFavoritos();
    };

    /* ==========================================================================
       6. SEÇÃO FAVORITOS
       ========================================================================== */
    function mostrarFavoritos() {
        const favoritosContainer = document.querySelector(".profile-favorites");
        if (!favoritosContainer) return;

        const obras = JSON.parse(localStorage.getItem("obrasMoonie")) || [];
        const favoritos = obras.filter(o => o.favorito);
        const favoritosLivros = lerFavoritosLivros();

        if (favoritos.length === 0 && favoritosLivros.length === 0) {
            favoritosContainer.innerHTML = `<p>Nenhum livro favoritado ainda.</p>`;
            return;
        }

        favoritosContainer.innerHTML = `
            <div class="profile-library-books">
                ${favoritosLivros.map((livro, index) => `
                    <article class="profile-library-book">
                        <div class="profile-library-cover">
                            <span>${livro.titulo}</span>
                        </div>
                        <div class="profile-library-info">
                            <p>${livro.categoria || 'Livro'}</p>
                            <h3>${livro.titulo}</h3>
                            <span>${livro.autor}</span>

                            <div class="card-actions">
                                <button class="btn-card btn-fav" onclick="removerFavoritoLivro(${index})">⭐ Remover dos favoritos</button>
                            </div>
                        </div>
                    </article>
                `).join("")}

                ${favoritos.map((obra) => `
                    <article class="profile-library-book">
                        <div class="profile-library-cover">
                            <span>${obra.titulo}</span>
                        </div>
                        <div class="profile-library-info">
                            <p>${obra.genero || 'História'}</p>
                            <h3>${obra.titulo}</h3>
                            <span>${obra.autor}</span>
                        </div>
                    </article>
                `).join("")}
            </div>
        `;
    }

    // Inicialização da página
    renderizarBiblioteca();
    mostrarFavoritos();

    // Se veio do botão "Favoritar" (perfil.html#favoritos), rola até a seção
    if (window.location.hash === "#favoritos") {
        const secaoFavoritos = document.getElementById("favoritos");
        if (secaoFavoritos) {
            secaoFavoritos.scrollIntoView({ behavior: "smooth" });
        }
    }
});