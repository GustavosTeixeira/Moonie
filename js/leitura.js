document.addEventListener("DOMContentLoaded", async () => {
    /* ==========================================================================
       1. CARREGADOR DO PDF.JS (Renderiza páginas diretamente no Canvas)
       ========================================================================== */
    function carregarBibliotecaPDF() {
        return new Promise((resolve, reject) => {
            if (window.pdfjsLib) return resolve(window.pdfjsLib);
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
            script.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
                resolve(window.pdfjsLib);
            };
            script.onerror = () => reject(new Error("Erro ao carregar leitor de PDF."));
            document.head.appendChild(script);
        });
    }

    /* ==========================================================================
       2. CONEXÃO AO INDEXEDDB (Busca arquivo salvo)
       ========================================================================== */
    function obterArquivoPDF(id) {
        return new Promise((resolve) => {
            const request = indexedDB.open("MoonieDB", 1);
            request.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("arquivos")) return resolve(null);
                const tx = db.transaction("arquivos", "readonly");
                const store = tx.objectStore("arquivos");
                const req = store.get(id.toString());
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            };
            request.onerror = () => resolve(null);
        });
    }

    /* ==========================================================================
       3. ELEMENTOS DA INTERFACE
       ========================================================================== */
    const obraAtual = JSON.parse(localStorage.getItem("obraAtual"));

    if (!obraAtual) {
        alert("Nenhuma história selecionada.");
        window.location.href = "perfil.html";
        return;
    }
    // Se o livro salvo não tem texto, busca o texto pelo título em textos-livros.js
    if (!obraAtual.conteudo && window.TEXTOS_LIVROS && window.TEXTOS_LIVROS[obraAtual.titulo]) {
        obraAtual.conteudo = window.TEXTOS_LIVROS[obraAtual.titulo];
    }
    
    const tituloEl = document.querySelector(".reading-top span:first-child");
    const containerConteudo = document.querySelector(".reading-content");
    const botaoAnterior = document.getElementById("previous-page");
    const botaoProximo = document.getElementById("next-page");
    const paginaTexto = document.querySelector(".reading-navigation span");
    const barraProgresso = document.querySelector(".progress-fill");
    const porcentagemEl = document.querySelector(".reading-top span:last-child");

    if (tituloEl) tituloEl.textContent = obraAtual.titulo;

    const chavePagina = `paginaLeitura_${obraAtual.id || obraAtual.titulo}`;
    let paginaAtual = Number(localStorage.getItem(chavePagina)) || 1;
    let totalPaginas = 1;
    let pdfDoc = null;
    let renderizando = false;
    let paginaPendente = null;

    // Controle de Zoom para PDF e Fonte para Texto
    let escalaPDF = 1.0; // Zoom base para PDF
    let tamanhoFonte = 16; // Fonte base para Texto

    /* ==========================================================================
       4. ATUALIZAÇÃO DA INTERFACE (Barra de progresso e números)
       ========================================================================== */
    function atualizarUI() {
        if (totalPaginas < 1) totalPaginas = 1;
        const progresso = Math.min(Math.max((paginaAtual / totalPaginas) * 100, 1), 100);

        if (barraProgresso) barraProgresso.style.width = progresso + "%";
        if (porcentagemEl) porcentagemEl.textContent = Math.round(progresso) + "%";
        if (paginaTexto) {
            paginaTexto.textContent = totalPaginas > 1 
                ? `PÁGINA ${paginaAtual} DE ${totalPaginas}` 
                : `PÁGINA ${paginaAtual}`;
        }

        localStorage.setItem(chavePagina, paginaAtual);
    }

    /* ==========================================================================
       5. RENDERIZAÇÃO DA PÁGINA DO PDF COM SUPORTE A ZOOM
       ========================================================================== */
    async function renderizarPaginaPDF(num) {
        if (!pdfDoc) return;
        renderizando = true;

        try {
            const page = await pdfDoc.getPage(num);
            const canvas = document.getElementById("pdf-canvas");
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            
            // Ajusta a escala base com base na largura da tela + multiplicador de zoom
            const larguraContainer = (containerConteudo ? containerConteudo.clientWidth : 800) - 40;
            const viewportOriginal = page.getViewport({ scale: 1 });
            const escalaAuto = (larguraContainer / viewportOriginal.width) || 1.2;
            const escalaFinal = Math.min(escalaAuto, 1.4) * escalaPDF;

            const viewport = page.getViewport({ scale: escalaFinal });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            renderizando = false;

            if (paginaPendente !== null) {
                const proxima = paginaPendente;
                paginaPendente = null;
                renderizarPaginaPDF(proxima);
            }
        } catch (err) {
            console.error("Erro ao renderizar página:", err);
            renderizando = false;
        }

        atualizarUI();
    }

    function irParaPagina(num) {
        if (num < 1 || num > totalPaginas) return;
        paginaAtual = num;

        if (pdfDoc) {
            if (renderizando) {
                paginaPendente = num;
            } else {
                renderizarPaginaPDF(num);
            }
        } else {
            atualizarUI();
        }
    }

    /* ==========================================================================
       6. CARREGAMENTO DA OBRA
       ========================================================================== */
    const urlArquivo = obraAtual.arquivoUrl || obraAtual.arquivo || obraAtual.pdfUrl || obraAtual.url;

    if (obraAtual.tipo === "upload" || urlArquivo || obraAtual.nomeArquivo) {
        if (containerConteudo) {
            containerConteudo.innerHTML = `
                <div id="pdf-loading" style="text-align: center; padding: 60px; color: #d1d5db;">
                    <p style="font-size: 18px; margin-bottom: 10px;">Carregando livro...</p>
                </div>
                <div style="display: flex; justify-content: center; width: 100%; overflow: auto;">
                    <canvas id="pdf-canvas" style="border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,0.6); max-width: 100%; height: auto;"></canvas>
                </div>
            `;
        }

        try {
            const pdfjsLib = await carregarBibliotecaPDF();
            const blobFile = await obterArquivoPDF(obraAtual.id);
            let pdfData = null;

            if (blobFile) {
                pdfData = await blobFile.arrayBuffer();
            } else if (urlArquivo && urlArquivo !== "undefined") {
                pdfData = urlArquivo;
            }

            if (pdfData) {
                pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
                totalPaginas = pdfDoc.numPages;

                const loadingEl = document.getElementById("pdf-loading");
                if (loadingEl) loadingEl.remove();

                if (paginaAtual > totalPaginas) paginaAtual = 1;
                renderizarPaginaPDF(paginaAtual);
            } else {
                if (containerConteudo) {
                    containerConteudo.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #ff6b6b;">
                            <h3>Arquivo PDF não encontrado.</h3>
                            <p>Volte ao seu perfil e envie o livro novamente.</p>
                        </div>
                    `;
                }
            }
        } catch (erro) {
            console.error("Erro ao carregar PDF:", erro);
        }
    } else if (obraAtual.conteudo) {
        // Leitura de texto digitado
        if (containerConteudo) {
            const paragrafos = obraAtual.conteudo
                .split("\n")
                .filter(p => p.trim() !== "")
                .map(p => `<p>${p}</p>`)
                .join("");

            containerConteudo.innerHTML = `
                <p class="chapter-label">POR: ${(obraAtual.autor || "Autor").toUpperCase()}</p>
                <h1 style="margin-bottom: 24px; font-family: serif;">${obraAtual.titulo}</h1>
                ${paragrafos}
            `;
        }
        totalPaginas = 88;
        atualizarUI();
    }

    /* ==========================================================================
       7. NAVEGAÇÃO (Botões Anterior/Próximo e Teclas do Teclado)
       ========================================================================== */
    if (botaoProximo) {
        botaoProximo.addEventListener("click", (e) => {
            e.preventDefault();
            if (paginaAtual < totalPaginas) irParaPagina(paginaAtual + 1);
        });
    }

    if (botaoAnterior) {
        botaoAnterior.addEventListener("click", (e) => {
            e.preventDefault();
            if (paginaAtual > 1) irParaPagina(paginaAtual - 1);
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" && paginaAtual < totalPaginas) {
            irParaPagina(paginaAtual + 1);
        } else if (e.key === "ArrowLeft" && paginaAtual > 1) {
            irParaPagina(paginaAtual - 1);
        }
    });

    /* ==========================================================================
       8. CONTROLE DE AJUSTES (A- / A / A+) -> ZOOM NO PDF OU FONTE EM TEXTO
       ========================================================================== */
    const btnMenos = document.getElementById("font-minus");
    const btnNormal = document.getElementById("font-normal");
    const btnMais = document.getElementById("font-plus");

    function aplicarAjuste() {
        if (pdfDoc) {
            // Se for PDF: Redesenha a página com o novo Zoom
            renderizarPaginaPDF(paginaAtual);
        } else {
            // Se for Texto: Altera o tamanho do texto HTML
            document.querySelectorAll(".reading-content p:not(.chapter-label)").forEach(p => {
                p.style.fontSize = tamanhoFonte + "px";
            });
        }
    }

    if (btnMenos) {
        btnMenos.onclick = (e) => {
            e.preventDefault();
            if (pdfDoc) {
                if (escalaPDF > 0.6) { escalaPDF -= 0.15; aplicarAjuste(); }
            } else {
                if (tamanhoFonte > 12) { tamanhoFonte -= 2; aplicarAjuste(); }
            }
        };
    }

    if (btnNormal) {
        btnNormal.onclick = (e) => {
            e.preventDefault();
            if (pdfDoc) {
                escalaPDF = 1.0;
                aplicarAjuste();
            } else {
                tamanhoFonte = 16;
                aplicarAjuste();
            }
        };
    }

    if (btnMais) {
        btnMais.onclick = (e) => {
            e.preventDefault();
            if (pdfDoc) {
                if (escalaPDF < 2.0) { escalaPDF += 0.15; aplicarAjuste(); }
            } else {
                if (tamanhoFonte < 24) { tamanhoFonte += 2; aplicarAjuste(); }
            }
        };
    }
});