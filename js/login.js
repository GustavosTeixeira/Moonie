const REDIRECT_APOS_LOGIN = "perfil.html";

function setupPasswordToggle() {
  const toggleBtn = document.getElementById("toggle-senha");
  const senhaInput = document.getElementById("senha");
  if (!toggleBtn || !senhaInput) return;

  const eyeIcon = toggleBtn.querySelector(".icon-eye");
  const eyeOffIcon = toggleBtn.querySelector(".icon-eye-off");

  toggleBtn.addEventListener("click", () => {
    const isPassword = senhaInput.type === "password";
    senhaInput.type = isPassword ? "text" : "password";
    if (eyeIcon && eyeOffIcon) {
      eyeIcon.classList.toggle("is-visible", !isPassword);
      eyeOffIcon.classList.toggle("is-visible", isPassword);
    }
    toggleBtn.setAttribute("aria-pressed", String(isPassword));
  });
}

function setFieldError(input, errorEl, message) {
  if (!input || !errorEl) return;
  if (message) {
    input.classList.add("invalid");
    errorEl.textContent = message;
  } else {
    input.classList.remove("invalid");
    errorEl.textContent = "";
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setupForm() {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const emailError = document.getElementById("email-error");
  const senhaError = document.getElementById("senha-error");
  const submitBtn = document.getElementById("submit-btn");
  const statusEl = document.getElementById("form-status");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    let valid = true;
    const emailValor = emailInput.value.trim().toLowerCase();
    const senhaValor = senhaInput.value;

    if (!EMAIL_REGEX.test(emailValor)) {
      setFieldError(emailInput, emailError, "Digite um e-mail válido.");
      valid = false;
    } else {
      setFieldError(emailInput, emailError, "");
    }

    if (!senhaValor) {
      setFieldError(senhaInput, senhaError, "Digite sua senha.");
      valid = false;
    } else {
      setFieldError(senhaInput, senhaError, "");
    }

    if (!valid) return;

    submitBtn.classList.add("is-loading");
    submitBtn.textContent = "ENTRANDO...";

    setTimeout(() => {
      // Consultar no localStorage
      const usuarios = JSON.parse(localStorage.getItem("usuariosMoonie")) || [];
      const usuarioEncontrado = usuarios.find(
        (u) => u.email.toLowerCase() === emailValor && u.senha === senhaValor
      );

      if (!usuarioEncontrado) {
        statusEl.textContent = "E-mail ou senha incorretos.";
        statusEl.classList.add("error");
        submitBtn.classList.remove("is-loading");
        submitBtn.textContent = "ENTRAR";
        return;
      }

            // Salva a sessão ativa
      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));

      let destino = REDIRECT_APOS_LOGIN;

      // Livro que estava esperando o login no botão "Quero ler"
      const livroPendente = JSON.parse(localStorage.getItem("livroPendente"));

      if (livroPendente) {
        const chaveLeitura = "leitura_" + usuarioEncontrado.email;
        const listaLeitura = JSON.parse(localStorage.getItem(chaveLeitura)) || [];

        const jaExiste = listaLeitura.some((l) => l.titulo === livroPendente.titulo);

        if (!jaExiste) {
          listaLeitura.push(livroPendente);
          localStorage.setItem(chaveLeitura, JSON.stringify(listaLeitura));
        }

        localStorage.removeItem("livroPendente");
        destino = "minha-leitura.html";
      }

      // Livro que estava esperando o login no botão "Favoritar"
      const favoritoPendente = JSON.parse(localStorage.getItem("favoritoPendente"));

      if (favoritoPendente) {
        const chaveFavoritos = "favoritos_" + usuarioEncontrado.email;
        const listaFavoritos = JSON.parse(localStorage.getItem(chaveFavoritos)) || [];

        const jaFavoritado = listaFavoritos.some((l) => l.titulo === favoritoPendente.titulo);

        if (!jaFavoritado) {
          listaFavoritos.push(favoritoPendente);
          localStorage.setItem(chaveFavoritos, JSON.stringify(listaFavoritos));
        }

        localStorage.removeItem("favoritoPendente");
        destino = "perfil.html#favoritos";
      }

      statusEl.textContent = `Bem-vindo(a), ${usuarioEncontrado.nome}! Redirecionando...`;
      statusEl.classList.add("success");

      setTimeout(() => {
        window.location.href = destino;
      }, 900);
    }, 400);
  });

  emailInput.addEventListener("input", () => setFieldError(emailInput, emailError, ""));
  senhaInput.addEventListener("input", () => setFieldError(senhaInput, senhaError, ""));
}

document.addEventListener("DOMContentLoaded", () => {
  setupPasswordToggle();
  setupForm();
});