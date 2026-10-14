const formulario = document.getElementById("cadastroForm");
const nome = document.getElementById("nome");
const email = document.getElementById("email");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    if (senha.value !== confirmarSenha.value) {
        alert("As senhas não coincidem.");
        return;
    }

    // 1. Buscar lista de usuários cadastrados
    const usuarios = JSON.parse(localStorage.getItem("usuariosMoonie")) || [];

    // 2. Verificar se o e-mail já existe
    const usuarioExiste = usuarios.some(u => u.email.toLowerCase() === email.value.trim().toLowerCase());
    if (usuarioExiste) {
        alert("Este e-mail já está cadastrado!");
        return;
    }

    // 3. Cadastrar novo usuário
    const novoUsuario = {
        nome: nome.value.trim(),
        email: email.value.trim().toLowerCase(),
        senha: senha.value
    };

    usuarios.push(novoUsuario);
    localStorage.setItem("usuariosMoonie", JSON.stringify(usuarios));

    alert("Conta criada com sucesso!");
    window.location.href = "login.html";
});

// Toggle de visualização de senha
const botoesOlho = document.querySelectorAll(".eye");
botoesOlho.forEach(function (botao) {
    botao.addEventListener("click", function () {
        const campo = document.getElementById(botao.dataset.target);
        campo.type = campo.type === "password" ? "text" : "password";
    });
});