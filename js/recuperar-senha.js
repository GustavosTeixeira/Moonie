document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recuperar-form");
  const emailInput = document.getElementById("email");
  const novaSenhaInput = document.getElementById("nova-senha");
  const confirmarNovaSenhaInput = document.getElementById("confirmar-nova-senha");

  const emailError = document.getElementById("email-error");
  const novaSenhaError = document.getElementById("nova-senha-error");
  const confirmarNovaSenhaError = document.getElementById("confirmar-nova-senha-error");
  const statusEl = document.getElementById("form-status");

  if (!form) return;

  function limparErros() {
    if (emailError) emailError.textContent = "";
    if (novaSenhaError) novaSenhaError.textContent = "";
    if (confirmarNovaSenhaError) confirmarNovaSenhaError.textContent = "";
    statusEl.textContent = "";
    statusEl.className = "form-status";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    limparErros();

    const emailValor = emailInput.value.trim().toLowerCase();
    const novaSenha = novaSenhaInput.value;
    const confirmarNovaSenha = confirmarNovaSenhaInput.value;

    let temErro = false;

    // 1. Validações básicas
    if (!emailValor) {
      if (emailError) emailError.textContent = "Por favor, digite seu e-mail.";
      temErro = true;
    }

    if (!novaSenha) {
      if (novaSenhaError) novaSenhaError.textContent = "Digite a nova senha.";
      temErro = true;
    }

    if (!confirmarNovaSenha) {
      if (confirmarNovaSenhaError) confirmarNovaSenhaError.textContent = "Confirme a nova senha.";
      temErro = true;
    }

    if (temErro) return;

    if (novaSenha !== confirmarNovaSenha) {
      if (confirmarNovaSenhaError) confirmarNovaSenhaError.textContent = "As senhas não coincidem.";
      return;
    }

    // 2. Buscar e atualizar no localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuariosMoonie")) || [];
    const indexUsuario = usuarios.findIndex((u) => u.email.toLowerCase() === emailValor);

    if (indexUsuario !== -1) {
      // Atualiza a senha do usuário correspondente
      usuarios[indexUsuario].senha = novaSenha;
      localStorage.setItem("usuariosMoonie", JSON.stringify(usuarios));

      statusEl.textContent = "Senha alterada com sucesso! Redirecionando para o login...";
      statusEl.className = "form-status success";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      statusEl.textContent = "E-mail não encontrado no sistema.";
      statusEl.className = "form-status error";
    }
  });

  emailInput.addEventListener("input", limparErros);
  novaSenhaInput.addEventListener("input", limparErros);
  confirmarNovaSenhaInput.addEventListener("input", limparErros);
});