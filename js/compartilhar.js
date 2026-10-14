document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================
     1. BANCO DE DADOS (INDEXEDDB PARA ARQUIVOS)
     ========================================== */
  function abrirBanco() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("MoonieDB", 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("arquivos")) {
          db.createObjectStore("arquivos");
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async function salvarArquivoPDF(id, file) {
    const db = await abrirBanco();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("arquivos", "readwrite");
      const store = tx.objectStore("arquivos");
      const req = store.put(file, id.toString());
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /* ==========================================
     2. TROCA DE ABAS
     ========================================== */
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");
    });
  });

  /* ==========================================
     3. DRAG & DROP DE ARQUIVOS
     ========================================== */
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  const fileNamePreview = document.getElementById("file-name");

  if (dropZone && fileInput) {
    dropZone.addEventListener("click", () => fileInput.click());

    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "#f0993d";
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.style.borderColor = "rgba(255, 255, 255, 0.18)";
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "rgba(255, 255, 255, 0.18)";
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        exibirNomeArquivo(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", () => {
      if (fileInput.files.length) exibirNomeArquivo(fileInput.files[0]);
    });
  }

  function exibirNomeArquivo(file) {
    if (fileNamePreview) {
      fileNamePreview.textContent = `Arquivo selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    }
  }

  /* ==========================================
     4. ENVIO DOS FORMULÁRIOS
     ========================================== */
  const uploadForm = document.getElementById("upload-form");
  const writeForm = document.getElementById("write-form");

  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const file = fileInput.files[0];
      if (!file) {
        alert("Por favor, selecione um arquivo PDF para enviar.");
        return;
      }

      const idUnico = Date.now();

      try {
        // Salva o arquivo binário no IndexedDB
        await salvarArquivoPDF(idUnico, file);

        const novaObra = {
          id: idUnico,
          tipo: "upload",
          titulo: document.getElementById("upload-title").value,
          autor: document.getElementById("upload-author").value,
          genero: document.getElementById("upload-genre").value,
          sinopse: document.getElementById("upload-synopsis").value,
          nomeArquivo: file.name,
          dataCriacao: new Date().toLocaleDateString("pt-BR"),
          favorito: false,
          concluido: false
        };

        salvarObraLocalStorage(novaObra);
      } catch (err) {
        alert("Erro ao salvar arquivo grande: " + err.message);
      }
    });
  }

  if (writeForm) {
    writeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || { nome: "Anônimo" };

      const novaObra = {
        id: Date.now(),
        tipo: "escrita",
        titulo: document.getElementById("write-title").value,
        autor: usuarioLogado.nome,
        genero: document.getElementById("write-genre").value,
        conteudo: document.getElementById("write-content").value,
        dataCriacao: new Date().toLocaleDateString("pt-BR"),
        favorito: false,
        concluido: false
      };

      salvarObraLocalStorage(novaObra);
    });
  }

  function salvarObraLocalStorage(obra) {
    const obrasExistentes = JSON.parse(localStorage.getItem("obrasMoonie")) || [];
    obrasExistentes.push(obra);
    localStorage.setItem("obrasMoonie", JSON.stringify(obrasExistentes));

    alert("Obra publicada com sucesso!");
    window.location.href = "perfil.html";
  }
});