/* ==========================================================================
   chat-widget.js — injeta o widget, carrega o CSS e controla abrir/fechar.
   ========================================================================== */

function setupChatWidget() {
  // 1. Detecta se a página atual está dentro da pasta /pages/
  const estaNaPastaPages = window.location.pathname.includes("/pages/");
  const caminhoIframe = estaNaPastaPages ? "chatbot.html" : "pages/chatbot.html";
  const caminhoCss = estaNaPastaPages ? "../css/chat-widget.css" : "css/chat-widget.css"; // Ajuste o nome do seu CSS se for diferente

  // 2. Garante que o CSS do widget seja carregado na página
  if (!document.getElementById("chat-widget-style")) {
    const linkStyle = document.createElement("link");
    linkStyle.id = "chat-widget-style";
    linkStyle.rel = "stylesheet";
    linkStyle.href = caminhoCss;
    document.head.appendChild(linkStyle);
  }

  // 3. Se a estrutura do widget ainda não existir, injeta no final do body
  if (!document.getElementById("chat-widget-btn")) {
    const widgetHTML = `
      <!-- ===== Widget de chat flutuante (Moonie) ===== -->
      <button id="chat-widget-btn" class="chat-widget-btn" aria-label="Abrir chat com a Moonie">💬</button>

      <div id="chat-widget-panel" class="chat-widget-panel">
          <button id="chat-widget-close" class="chat-widget-close" aria-label="Fechar chat">×</button>
          <iframe id="chat-widget-iframe" data-src="${caminhoIframe}" title="Assistente Moonie"></iframe>
      </div>
      <!-- ===== fim do widget de chat ===== -->
    `;
    document.body.insertAdjacentHTML("beforeend", widgetHTML);
  }

  // 4. Captura os elementos do DOM
  const botao = document.getElementById("chat-widget-btn");
  const painel = document.getElementById("chat-widget-panel");
  const fechar = document.getElementById("chat-widget-close");
  const iframe = document.getElementById("chat-widget-iframe");

  if (!botao || !painel || !iframe) return;

  let carregado = false;

  function abrirPainel() {
    painel.classList.add("open");
    if (!carregado) {
      iframe.src = iframe.dataset.src;
      carregado = true;
    }
  }

  function fecharPainel() {
    painel.classList.remove("open");
  }

  botao.addEventListener("click", () => {
    const estaAberto = painel.classList.contains("open");
    estaAberto ? fecharPainel() : abrirPainel();
  });

  if (fechar) {
    fechar.addEventListener("click", fecharPainel);
  }
}

document.addEventListener("DOMContentLoaded", setupChatWidget);