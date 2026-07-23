import type { Messages } from "./types";

export const ptBR: Messages = {
  metaDescription:
    "Portfólio interativo de Bruno Teixeira: explore projetos backend, APIs e agentes de IA conversando sobre o código.",
  language: {
    selectorLabel: "Idioma",
    portugueseLabel: "Português (Brasil)",
    englishLabel: "English",
  },
  header: {
    homeAria: "Encore — página inicial",
    navigationAria: "Navegação principal",
    about: "Sobre",
    projects: "Projetos",
  },
  about: {
    role: "Bruno Teixeira · Backend Developer",
    title: "Backend, APIs e agentes de IA construídos para funcionar em produção.",
    bio: "Sou desenvolvedor backend com foco em Python (Django/FastAPI) e Go. Desenvolvo e opero APIs e sistemas com LLMs, da arquitetura ao deploy, com foco em testes automatizados, segurança e observabilidade. Também contribuo para projetos open source, incluindo o Caddy.",
    professionalLinksAria: "Links profissionais",
    encore: {
      eyebrow: "Como funciona",
      title: "Um portfólio que responde.",
      intro:
        "O Encore é um portfólio interativo que transforma meus repositórios em uma experiência de exploração. Em vez de apenas listar projetos, ele permite investigar decisões de arquitetura, implementação, testes e segurança conversando diretamente sobre o código.",
      highlight:
        "Não é um chat genérico: cada resposta parte do projeto selecionado e vem acompanhada das ferramentas que o agente usou para encontrá-la.",
      stepsAria: "Como o Encore funciona",
      steps: [
        {
          title: "Escolha um projeto",
          description: "Conheça a stack, o propósito e sugestões do que explorar.",
        },
        {
          title: "Pergunte ao código",
          description:
            "O agente busca arquivos e trechos relevantes no repositório.",
        },
        {
          title: "Acompanhe o percurso",
          description: "Veja as ferramentas consultadas junto da resposta.",
        },
      ],
      architectureAria: "Arquitetura do Encore",
      interfaceLabel: "Interface",
      interfaceDescription: "React, TypeScript, Vite e Cloudflare Pages.",
      agentLabel: "Agente",
      agentDescription:
        "Python, FastAPI, LangGraph e ferramentas de leitura do código.",
      tryEyebrow: "Experimente agora",
      tryDescription: "Escolha um projeto e faça sua primeira pergunta.",
      cta: "Conversar sobre os projetos",
    },
  },
  projects: {
    eyebrow: "Explore o código",
    title: "Converse com os projetos.",
    subtitle: "Faça uma pergunta e acompanhe a investigação do agente.",
    loading: "Carregando projetos…",
    loadError:
      "Não consegui carregar a lista de projetos — recarregue a página.",
    empty: "Nenhum projeto disponível no momento — volte em breve.",
    selectorAria: "Projetos",
    aboutRepo: (displayName) => `Sobre ${displayName}`,
    stackAria: "Stack e tecnologias",
    suggestedQuestion: "Experimente perguntar",
    repositoryLink: "GitHub",
    repositoryLinkAria: (displayName) => `Abrir ${displayName} no GitHub`,
  },
  chat: {
    regionAria: (repoId) => `Conversa sobre ${repoId}`,
    formatting: "Formatando resposta…",
    loading: "O agente está investigando o código…",
    questionAria: "Pergunta sobre o projeto",
    placeholder: "Pergunte algo sobre o código deste projeto…",
    shortcutTitle: "Enter envia · Shift+Enter insere uma nova linha",
    send: "Enviar",
  },
  trajectory: {
    title: "Caminho da investigação",
    steps: (count) => `${count} ${count === 1 ? "etapa" : "etapas"}`,
    iterations: (count) => `${count} ${count === 1 ? "iteração" : "iterações"}`,
  },
  errors: {
    unknownRepo: "Este projeto não está disponível no momento.",
    validation: "Revise a pergunta e tente novamente.",
    rateLimit: "O limite de perguntas foi atingido. Tente novamente mais tarde.",
    generic: "Não foi possível obter uma resposta. Tente novamente em instantes.",
  },
  projectDetails: {
    overture: {
      summary:
        "Agente ReAct que investiga repositórios Git com ferramentas próprias, guardrails de segurança e trajetória auditável.",
      stack: ["Python", "FastAPI", "LangGraph", "Docker", "Fly.io"],
      suggestedQuestion: "Como os guardrails limitam o uso das ferramentas?",
    },
    codda: {
      summary:
        "Serviço de pedidos em Go que aplica arquitetura hexagonal, DDD tático e uma máquina de estados explícita.",
      stack: ["Go", "PostgreSQL", "Testcontainers", "Arquitetura hexagonal"],
      suggestedQuestion:
        "Como a máquina de estados protege as transições de pedido?",
    },
    briskmail: {
      summary:
        "Produto de análise de e-mails com LLMs, formado por API, extensão para Chrome e uma camada agnóstica de provedor.",
      stack: ["FastAPI", "OpenAI", "Ollama", "Chrome Extension", "Fly.io"],
      suggestedQuestion: "Como o cache evita reprocessar o mesmo e-mail?",
    },
    interlude: {
      summary:
        "Reverse proxy e API gateway construído do zero em Go para explorar concorrência, resiliência e observabilidade.",
      stack: ["Go", "Standard library", "Prometheus", "Docker"],
      suggestedQuestion: "Como circuit breaker e health checks trabalham juntos?",
    },
    encore: {
      summary:
        "SPA deste portfólio interativo, com um proxy serverless que mantém a chave da API fora do navegador.",
      stack: ["React", "TypeScript", "Vite", "Cloudflare Pages"],
      suggestedQuestion: "Como a chave da API fica protegida do browser?",
    },
  },
};
