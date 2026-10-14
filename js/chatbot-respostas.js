/* ==========================================================================
   chatbot-respostas.js
   Guarda os DADOS do chatbot: cada "intenção" tem palavras-chave (padroes)
   que, se aparecerem na mensagem do usuário, disparam uma resposta.
   Separar dados de lógica (assim como em books.js/events.js) facilita
   adicionar ou editar respostas sem mexer no motor do chat (chatbot.js).
   ========================================================================== */

const CHAT_INTENTS = [
  {
    id: "saudacao",
    padroes: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "hey", "eae", "e ai", "salve"],
    respostas: [
      "Olá! 🌙 Sou o assistente virtual da Moonie. Posso ajudar com horários, reservas, eventos, espaços ou indicar um livro pro seu momento. O que você precisa?",
    ],
  },
  {
    id: "horario",
    padroes: ["horario", "funciona", "aberto", "fecha", "atende", "que horas"],
    respostas: [
      "Nosso atendimento funciona: Seg a Sex das 9h às 21h, Sábado das 10h às 18h e Domingo das 13h às 18h.",
    ],
  },
  {
    id: "reservar",
    padroes: ["reservar", "reserva", "emprestar", "pegar um livro", "alugar livro", "retirar livro"],
    respostas: [
      "Para reservar: acesse o Acervo, escolha um título com status \"Disponível\" e clique em \"Reservar\". A confirmação fica salva na sua conta.",
    ],
  },
  {
    id: "cadastro",
    padroes: ["cadastro", "cadastrar", "criar conta", "registrar", "me inscrever"],
    respostas: [
      "Você pode criar sua conta na página de Cadastro — só nome, e-mail e senha, rapidinho.",
    ],
  },
  {
    id: "login",
    padroes: ["login", "entrar na conta", "logar", "acessar minha conta", "fazer login"],
    respostas: [
      "Para entrar, use a página de Login com o e-mail e a senha cadastrados.",
    ],
  },
  {
    id: "senha",
    padroes: ["esqueci a senha", "recuperar senha", "perdi minha senha", "trocar senha"],
    respostas: [
      "Na tela de login tem o link \"Esqueceu sua senha?\" — é por ali que a recuperação vai acontecer.",
    ],
  },
  {
    id: "espacos",
    padroes: ["espaco", "sala de leitura", "cafe literario", "espaco de estudo", "jardim", "sala de grupo"],
    respostas: [
      "Temos Sala de Leitura, Espaço de Estudo, Café Literário, Jardim Interno e Salas de Grupo. Dá uma olhada na seção Espaços do site pra conhecer cada um.",
    ],
  },
  {
    id: "eventos",
    padroes: ["evento", "clube do livro", "encontro com escritor", "noite da poesia", "contacao de historia", "programacao"],
    respostas: [
      "Toda semana rola algo novo: Noite da Poesia, Clube do Livro, Contação de História e Encontros com Escritores. A agenda completa está na seção Eventos.",
    ],
  },
  {
    id: "humor",
    padroes: ["indicar um livro", "sugestao de livro", "nao sei o que ler", "recomendar livro", "indicacao", "qual livro"],
    respostas: [
      "Me conta como você quer se sentir agora: emocionar, sonhar, aconchegar, aprender, relaxar ou refletir?",
    ],
    sugestoes: ["Quero emocionar", "Quero sonhar", "Quero aconchegar", "Quero relaxar", "Quero refletir"],
  },
  {
    id: "humor_emocionar",
    padroes: ["quero emocionar", "chorar", "me emocionar"],
    respostas: ["Pra chorar e se conectar: \"A Biblioteca da Meia-Noite\", de Matt Haig — está disponível no acervo."],
  },
  {
    id: "humor_sonhar",
    padroes: ["quero sonhar", "me transportar", "fantasia"],
    respostas: ["Pra sonhar: \"Pachinko\", de Min Jin Lee, te transporta por gerações inteiras."],
  },
  {
    id: "humor_aconchegar",
    padroes: ["quero aconchegar", "aconchego", "algo leve"],
    respostas: ["Pra aconchegar: \"As Vantagens de Ser Invisível\", de Stephen Chbosky, é perfeito pra uma noite tranquila."],
  },
  {
    id: "humor_relaxar",
    padroes: ["quero relaxar", "desacelerar", "descontrair"],
    respostas: ["Pra relaxar: \"O Sol é Para Todos\", de Harper Lee, tem um ritmo leve e envolvente."],
  },
  {
    id: "humor_refletir",
    padroes: ["quero refletir", "pensar", "reflexao"],
    respostas: ["Pra refletir: \"O Morro dos Ventos Uivantes\", de Emily Brontë, rende reflexão pra semana toda."],
  },
  {
    id: "contato",
    padroes: ["contato", "telefone", "whatsapp", "e-mail", "email", "falar com atendente", "humano", "atendente"],
    respostas: [
      "Pode falar com a gente por (11) 9 3907-6416 ou moonie_schnee@gmail.com. Mas se quiser, deixa sua dúvida aqui mesmo que eu tento ajudar primeiro!",
    ],
  },
  {
    id: "despedida",
    padroes: ["tchau", "ate mais", "valeu", "obrigado", "obrigada", "flw", "ate logo"],
    respostas: ["Até mais! Boa leitura e boa noite 🌙"],
  },
];

// Resposta usada quando nenhuma intenção acima combina com o que foi digitado
const CHAT_FALLBACK =
  "Ainda não entendi essa 🌙 Mas posso ajudar com horários, reservas, cadastro/login, espaços, eventos, ou indicar um livro pelo seu humor.";

// Sugestões (chips) mostradas assim que o chat abre
const CHAT_SUGESTOES_INICIAIS = [
  "Horário de funcionamento",
  "Como reservar um livro",
  "Indicar um livro pelo meu humor",
  "Quais eventos têm essa semana?",
];