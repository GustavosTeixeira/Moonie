document.addEventListener("DOMContentLoaded", () => {
    /* ==========================================================================
       1. BANCO DE DADOS DOS ESPAÇOS E SUGESTÕES
       ========================================================================== */
    const dadosEspacos = {
        cafe: {
            titulo: "Café Literário",
            desc: "Sinta o aroma do café fresco e o suave murmurinho de conversas enquanto se perde nas páginas de romances e contos envolventes.",
            somSugerido: "cafe",
            livros: [
                { titulo: "Jantar Secreto", autor: "Raphael Montes", capa: "☕" },
                { titulo: "A Hora da Estrela", autor: "Clarice Lispector", capa: "📖" },
                { titulo: "O Sol Também é Uma Estrela", autor: "Nicola Yoon", capa: "✨" }
            ]
        },
        estudo: {
            titulo: "Espaço de Estudo",
            desc: "Ambiente calmo e minimalista projetado para aumentar a sua concentração, ideal para leituras teóricas e aprendizado focado.",
            somSugerido: "chuva",
            livros: [
                { titulo: "Foco", autor: "Daniel Goleman", capa: "🧠" },
                { titulo: "Essencialismo", autor: "Greg McKeown", capa: "🎯" },
                { titulo: "Rápido e Devagar", autor: "Daniel Kahneman", capa: "⚡" }
            ]
        },
        leitura: {
            titulo: "Sala de Leitura",
            desc: "Uma poltrona macia, luz quente e o estalar suave da lareira. O ambiente perfeito para grandes clássicos e imersões profundas.",
            somSugerido: "lareira",
            livros: [
                { titulo: "Dom Casmurro", autor: "Machado de Assis", capa: "🏛️" },
                { titulo: "1984", autor: "George Orwell", capa: "👁️" },
                { titulo: "Orgulho e Preconceito", autor: "Jane Austen", capa: "🕯️" }
            ]
        },
        jardim: {
            titulo: "Jardim Aconchegante",
            desc: "O sopro suave do vento nas folhas e o canto dos passarinhos criam uma atmosfera inspiradora e relaxante para poesias e crônicas.",
            somSugerido: "natureza",
            livros: [
                { titulo: "O Apanhador no Campo de Centeio", autor: "J.D. Salinger", capa: "🌿" },
                { titulo: "Poemas Concisos", autor: "Carlos Drummond", capa: "🍃" },
                { titulo: "O Pequeno Príncipe", autor: "Antoine de Saint-Exupéry", capa: "🌹" }
            ]
        }
    };

    /* ==========================================================================
       2. REPRODUÇÃO DOS ÁUDIOS MP3 DA PASTA AUDIO/
       ========================================================================== */
    function toggleSom(chave) {
        const audioElement = document.getElementById(`audio-${chave}`);
        const itemEl = document.getElementById(`item-${chave}`);
        const iconEl = document.getElementById(`icon-${chave}`);
        const volInput = document.getElementById(`vol-${chave}`);

        if (!audioElement) return;

        if (!audioElement.paused) {
            audioElement.pause();
            if (itemEl) itemEl.classList.remove('active');
            if (iconEl) iconEl.className = 'fa-solid fa-play';
        } else {
            if (volInput) {
                audioElement.volume = parseFloat(volInput.value);
            }
            audioElement.play().catch(err => {
                console.log("Clique do usuário necessário para tocar o áudio:", err);
            });
            if (itemEl) itemEl.classList.add('active');
            if (iconEl) iconEl.className = 'fa-solid fa-pause';
        }
    }

    function ajustarVolume(chave, valor) {
        const audioElement = document.getElementById(`audio-${chave}`);
        if (audioElement) {
            audioElement.volume = parseFloat(valor);
        }
    }

    function desligarTodosSons() {
        ['cafe', 'chuva', 'lareira', 'natureza'].forEach(chave => {
            const audioElement = document.getElementById(`audio-${chave}`);
            const itemEl = document.getElementById(`item-${chave}`);
            const iconEl = document.getElementById(`icon-${chave}`);

            if (audioElement && !audioElement.paused) {
                audioElement.pause();
                if (itemEl) itemEl.classList.remove('active');
                if (iconEl) iconEl.className = 'fa-solid fa-play';
            }
        });
    }

    /* ==========================================================================
       3. TROCA DE ESPAÇO E ATUALIZAÇÃO DA INTERFACE
       ========================================================================== */
    function selecionarEspaco(chaveEspaco, targetBtn, tocarSom = false) {
        const espaco = dadosEspacos[chaveEspaco];
        if (!espaco) return;

        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        if (targetBtn) targetBtn.classList.add('active');

        const titleEl = document.getElementById('active-space-title');
        const descEl = document.getElementById('active-space-desc');
        const subTitleEl = document.getElementById('sub-space-title');

        if (titleEl) titleEl.textContent = espaco.titulo;
        if (descEl) descEl.textContent = espaco.desc;
        if (subTitleEl) subTitleEl.textContent = espaco.titulo;

        const containerLivros = document.getElementById('book-recommendations');
        if (containerLivros) {
            containerLivros.innerHTML = espaco.livros.map(l => `
                <div class="book-item">
                    <div class="book-cover">${l.capa}</div>
                    <div class="book-details">
                        <div class="book-title">${l.titulo}</div>
                        <div class="book-author">${l.autor}</div>
                    </div>
                    <a href="leitura.html" class="btn-read" data-titulo="${l.titulo}" data-autor="${l.autor}">
                        Ler Agora
                    </a>
                </div>
            `).join('');
        }

        if (tocarSom) {
            const sonsOuvindo = ['cafe', 'chuva', 'lareira', 'natureza'].some(s => {
                const el = document.getElementById(`audio-${s}`);
                return el && !el.paused;
            });
            
            if (!sonsOuvindo) {
                toggleSom(espaco.somSugerido);
            }
        }
    }

    /* ==========================================================================
       4. CRONÔMETRO DE FOCO (POMODORO)
       ========================================================================== */
    let timerInterval = null;
    let tempoRestante = 25 * 60;

    function atualizarDisplayTimer() {
        const min = Math.floor(tempoRestante / 60).toString().padStart(2, '0');
        const sec = (tempoRestante % 60).toString().padStart(2, '0');
        const display = document.getElementById('timer-display');
        if (display) display.textContent = `${min}:${sec}`;
    }

    function iniciarTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            if (tempoRestante > 0) {
                tempoRestante--;
                atualizarDisplayTimer();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                alert("Tempo de foco concluído! Faça uma pausa.");
            }
        }, 1000);
    }

    function pausarTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    function resetarTimer() {
        pausarTimer();
        tempoRestante = 25 * 60;
        atualizarDisplayTimer();
    }

    /* ==========================================================================
       5. EVENT LISTENERS
       ========================================================================== */
    // Botões das Abas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const espaco = e.currentTarget.getAttribute('data-espaco');
            selecionarEspaco(espaco, e.currentTarget, true);
        });
    });

    // Botões Play/Pause
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const som = e.currentTarget.getAttribute('data-som');
            toggleSom(som);
        });
    });

    // Sliders de Volume
    ['cafe', 'chuva', 'lareira', 'natureza'].forEach(som => {
        const input = document.getElementById(`vol-${som}`);
        if (input) {
            input.addEventListener('input', (e) => ajustarVolume(som, e.target.value));
        }
    });

    // Botão Silenciar
    const btnSilenciar = document.getElementById('btn-silenciar');
    if (btnSilenciar) {
        btnSilenciar.addEventListener('click', desligarTodosSons);
    }

    // Botões Timer
    const btnStart = document.getElementById('btn-timer-start');
    const btnPause = document.getElementById('btn-timer-pause');
    const btnReset = document.getElementById('btn-timer-reset');

    if (btnStart) btnStart.addEventListener('click', iniciarTimer);
    if (btnPause) btnPause.addEventListener('click', pausarTimer);
    if (btnReset) btnReset.addEventListener('click', resetarTimer);

    // Clique do Livro
    const containerLivros = document.getElementById('book-recommendations');
    if (containerLivros) {
        containerLivros.addEventListener('click', (e) => {
            const btnRead = e.target.closest('.btn-read');
            if (btnRead) {
                const titulo = btnRead.getAttribute('data-titulo');
                const autor = btnRead.getAttribute('data-autor');
                localStorage.setItem("obraAtual", JSON.stringify({
                    titulo: titulo,
                    autor: autor,
                    tipo: "texto"
                }));
            }
        });
    }

    // Carregamento Inicial
    const btnInicial = document.querySelector('.tab-btn.active');
    if (btnInicial) {
        const espacoInicial = btnInicial.getAttribute('data-espaco');
        selecionarEspaco(espacoInicial, btnInicial, false);
    }
});