/* ==========================================================================
   chatbot.js — o "motor" do chat: por baixo dos panos, é um sistema de
   correspondência de palavras-chave (não é uma IA real). O que ele faz:
   1) recebe o texto do usuário
   2) normaliza (minúsculo, sem acento) pra facilitar a comparação
   3) procura em CHAT_INTENTS (chatbot-respostas.js) alguma "padrao" que
      apareça dentro do texto
   4) responde com a frase associada, ou com CHAT_FALLBACK se não achar nada
   ========================================================================== */

// Remove acentos e deixa tudo minúsculo, pra "Reservar" e "reservár" baterem
// com o mesmo padrão cadastrado em chatbot-respostas.js
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove os acentos (sinais combinados)
    .trim();
}

// Procura, em ordem, a primeira intenção cujo algum "padrao" apareça
// dentro da mensagem do usuário já normalizada
function encontrarIntencao(mensagemUsuario) {
  const textoNormalizado = normalizar(mensagemUsuario);
  return CHAT_INTENTS.find((intencao) =>
    intencao.padroes.some((padrao) => textoNormalizado.includes(normalizar(padrao)))
  );
}

// Escolhe a resposta (aqui é sempre a primeira, mas o array já deixa
// preparado pra sortear entre variações no futuro, se quiser)
function gerarResposta(mensagemUsuario) {
  const intencao = encontrarIntencao(mensagemUsuario);
  if (!intencao) return { texto: CHAT_FALLBACK, sugestoes: [] };
  const texto = intencao.respostas[Math.floor(Math.random() * intencao.respostas.length)];
  return { texto, sugestoes: intencao.sugestoes || [] };
}

/* ---------- Renderização das mensagens na tela ---------- */
const listaMensagens = document.getElementById("chat-messages");
const listaSugestoes = document.getElementById("chat-suggestions");
const formulario = document.getElementById("chat-form");
const campoTexto = document.getElementById("chat-input");

function rolarParaFinal() {
  listaMensagens.scrollTop = listaMensagens.scrollHeight;
}

function adicionarMensagem(texto, autor) {
  const bolha = document.createElement("div");
  bolha.className = `msg ${autor === "user" ? "msg-user" : "msg-bot"}`;
  bolha.textContent = texto;
  listaMensagens.appendChild(bolha);
  rolarParaFinal();
}

// Mostra os "três pontinhos" por um tempinho antes da resposta aparecer —
// simula o bot "pensando" e deixa a conversa mais natural
function mostrarDigitando() {
  const bolha = document.createElement("div");
  bolha.className = "msg msg-bot msg-typing";
  bolha.id = "typing-indicator";
  bolha.innerHTML = "<span></span><span></span><span></span>";
  listaMensagens.appendChild(bolha);
  rolarParaFinal();
}

function removerDigitando() {
  const indicador = document.getElementById("typing-indicator");
  if (indicador) indicador.remove();
}

function renderizarChips(sugestoes) {
  listaSugestoes.innerHTML = "";
  sugestoes.forEach((texto) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = texto;
    chip.addEventListener("click", () => enviarMensagem(texto));
    listaSugestoes.appendChild(chip);
  });
}

/* ---------- Fluxo principal: enviar mensagem e receber resposta ---------- */
function enviarMensagem(texto) {
  const mensagem = texto.trim();
  if (!mensagem) return;

  adicionarMensagem(mensagem, "user");
  campoTexto.value = "";
  renderizarChips([]); // some com os chips antigos enquanto o bot "pensa"

  mostrarDigitando();

  // O atraso é só estético (simula tempo de resposta); num chatbot com IA
  // real, aqui entraria a espera de verdade pela chamada de API.
  setTimeout(() => {
    removerDigitando();
    const { texto: resposta, sugestoes } = gerarResposta(mensagem);
    adicionarMensagem(resposta, "bot");
    renderizarChips(sugestoes);
  }, 500 + Math.random() * 500);
}

formulario.addEventListener("submit", (e) => {
  e.preventDefault();
  enviarMensagem(campoTexto.value);
});

/* ---------- Mensagem de boas-vindas ao abrir o chat ---------- */
document.addEventListener("DOMContentLoaded", () => {
  adicionarMensagem(
    "Oi! 🌙 Eu sou o assistente virtual da Moonie. Posso ajudar com horários, reservas, eventos, espaços ou indicar um livro pro seu momento.",
    "bot"
  );
  renderizarChips(CHAT_SUGESTOES_INICIAIS);
  campoTexto.focus();

  // Se essa página estiver dentro de um <iframe> (caso do widget flutuante),
  // escondemos a setinha de voltar — quem fecha o chat ali é o botão "×"
  // do próprio painel, não faz sentido navegar a página inteira embutida.
  const estaDentroDeIframe = window.self !== window.top;
  if (estaDentroDeIframe) {
    document.getElementById("chat-back-link").style.display = "none";
  }
});