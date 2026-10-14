const botaoQueroLer = document.getElementById("btn-reading");
const botaoFavorito = document.getElementById("btn-favorite");

const livro = {
    titulo: "Alice no pais das maravilhas",
    autor: "Lewis Carroll",
    categoria: "Fantasia"
};

// ADICIONA O LIVRO NA LISTA DE LEITURA DO USUÁRIO
// Cada usuário tem a própria lista, guardada na chave "leitura_email"
// Retorna true se adicionou e false se o livro já estava na lista
function adicionarNaLeitura(emailUsuario, livroNovo) {

    const chave = "leitura_" + emailUsuario;
    const lista = JSON.parse(localStorage.getItem(chave)) || [];

    const jaExiste = lista.some(function (item) {
        return item.titulo === livroNovo.titulo;
    });

    if (jaExiste) {
        return false;
    }

    lista.push(livroNovo);
    localStorage.setItem(chave, JSON.stringify(lista));
    return true;
}


// QUERO LER
botaoQueroLer.addEventListener("click", function () {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    // NÃO ESTÁ LOGADO: guarda o livro e manda para o login
    if (!usuario) {

        localStorage.setItem(
            "livroPendente",
            JSON.stringify(livro)
        );

        alert("Faça login para adicionar o livro à sua leitura. Se ainda não tem conta, cadastre-se.");
        window.location.href = "login.html";
        return;
    }

    // JÁ ESTÁ LOGADO: adiciona direto na lista
    const adicionado = adicionarNaLeitura(usuario.email, livro);

    if (adicionado) {
        alert("Livro adicionado à sua leitura!");
    } else {
        alert("Esse livro já está na sua leitura.");
    }

    window.location.href = "minha-leitura.html";
});


// FAVORITOS DO USUÁRIO
// Cada usuário tem a própria lista, guardada na chave "favoritos_email"
function lerFavoritos(emailUsuario) {
    return JSON.parse(localStorage.getItem("favoritos_" + emailUsuario)) || [];
}

function livroEstaFavoritado(emailUsuario) {
    return lerFavoritos(emailUsuario).some(function (item) {
        return item.titulo === livro.titulo;
    });
}

function atualizarBotaoFavorito(favoritado) {
    botaoFavorito.innerHTML = favoritado ? "♥ Favoritado" : "♡ Favoritar";
}

// Ao abrir a página, mostra o estado certo do botão
const usuarioAtual = JSON.parse(localStorage.getItem("usuarioLogado"));

if (usuarioAtual) {
    atualizarBotaoFavorito(livroEstaFavoritado(usuarioAtual.email));
}


// FAVORITAR
botaoFavorito.addEventListener("click", function () {

    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    // NÃO ESTÁ LOGADO: guarda o livro e manda para o login
    if (!usuario) {

        localStorage.setItem(
            "favoritoPendente",
            JSON.stringify(livro)
        );

        alert("Faça login para favoritar o livro. Se ainda não tem conta, cadastre-se.");
        window.location.href = "login.html";
        return;
    }

    const chave = "favoritos_" + usuario.email;
    const lista = lerFavoritos(usuario.email);

    // JÁ ESTÁ FAVORITADO: remove da lista e fica na página
    if (livroEstaFavoritado(usuario.email)) {

        const novaLista = lista.filter(function (item) {
            return item.titulo !== livro.titulo;
        });

        localStorage.setItem(chave, JSON.stringify(novaLista));
        atualizarBotaoFavorito(false);
        return;
    }

    // NÃO ESTÁ FAVORITADO: adiciona e abre a seção de favoritos do perfil
    lista.push(livro);
    localStorage.setItem(chave, JSON.stringify(lista));

    window.location.href = "perfil.html#favoritos";
});