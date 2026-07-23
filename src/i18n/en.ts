import type { Messages } from "./types";

export const en: Messages = {
  metaDescription:
    "Bruno Teixeira's interactive portfolio: explore backend projects, APIs, and AI agents by asking questions about the code.",
  language: {
    selectorLabel: "Language",
    portugueseLabel: "Português (Brasil)",
    englishLabel: "English",
  },
  header: {
    homeAria: "Encore — home page",
    navigationAria: "Main navigation",
    about: "About",
    projects: "Projects",
  },
  about: {
    role: "Bruno Teixeira · Backend Developer",
    title: "Backend, APIs, and AI agents built for production.",
    bio: "I'm a backend developer focused on Python (Django/FastAPI) and Go. I build and operate APIs and LLM systems from architecture to deployment, with a focus on automated testing, security, and observability. I also contribute to open-source projects, including Caddy.",
    professionalLinksAria: "Professional links",
    encore: {
      eyebrow: "How it works",
      title: "A portfolio that answers.",
      intro:
        "Encore is an interactive portfolio that turns my repositories into an exploration experience. Instead of simply listing projects, it lets you investigate architecture, implementation, testing, and security decisions by talking directly about the code.",
      highlight:
        "This isn't a generic chat: every answer starts from the selected project and includes the tools the agent used to find it.",
      stepsAria: "How Encore works",
      steps: [
        {
          title: "Choose a project",
          description:
            "Learn about its stack, purpose, and suggestions for what to explore.",
        },
        {
          title: "Ask the code",
          description:
            "The agent searches the repository for relevant files and snippets.",
        },
        {
          title: "Follow the path",
          description: "See the tools consulted alongside the answer.",
        },
      ],
      architectureAria: "Encore architecture",
      interfaceLabel: "Interface",
      interfaceDescription: "React, TypeScript, Vite, and Cloudflare Pages.",
      agentLabel: "Agent",
      agentDescription:
        "Python, FastAPI, LangGraph, and tools for reading the code.",
      tryEyebrow: "Try it now",
      tryDescription: "Choose a project and ask your first question.",
      cta: "Chat about the projects",
    },
  },
  projects: {
    eyebrow: "Explore the code",
    title: "Chat with the projects.",
    subtitle: "Ask a question and follow the agent's investigation.",
    loading: "Loading projects…",
    loadError: "I couldn't load the project list — please reload the page.",
    empty: "No projects are available right now — check back soon.",
    selectorAria: "Projects",
    aboutRepo: (displayName) => `About ${displayName}`,
    stackAria: "Stack and technologies",
    suggestedQuestion: "Try asking",
    repositoryLink: "GitHub",
    repositoryLinkAria: (displayName) => `Open ${displayName} on GitHub`,
  },
  chat: {
    regionAria: (repoId) => `Conversation about ${repoId}`,
    formatting: "Formatting answer…",
    loading: "The agent is investigating the code…",
    questionAria: "Question about the project",
    placeholder: "Ask something about this project's code…",
    shortcutTitle: "Enter sends · Shift+Enter inserts a new line",
    send: "Send",
  },
  trajectory: {
    title: "Investigation path",
    steps: (count) => `${count} ${count === 1 ? "step" : "steps"}`,
    iterations: (count) => `${count} ${count === 1 ? "iteration" : "iterations"}`,
  },
  errors: {
    unknownRepo: "This project is not available right now.",
    validation: "Review your question and try again.",
    rateLimit: "The question limit has been reached. Please try again later.",
    generic: "I couldn't get an answer. Please try again in a moment.",
  },
  projectDetails: {
    overture: {
      summary:
        "A ReAct agent that explores Git repositories with custom tools, security guardrails, and an auditable trajectory.",
      stack: ["Python", "FastAPI", "LangGraph", "Docker", "Fly.io"],
      suggestedQuestion: "How do the guardrails limit tool usage?",
    },
    codda: {
      summary:
        "An order service in Go built with hexagonal architecture, tactical DDD, and an explicit state machine.",
      stack: ["Go", "PostgreSQL", "Testcontainers", "Hexagonal architecture"],
      suggestedQuestion:
        "How does the state machine protect order transitions?",
    },
    briskmail: {
      summary:
        "An LLM-powered email analysis product made up of an API, a Chrome extension, and a provider-agnostic AI layer.",
      stack: ["FastAPI", "OpenAI", "Ollama", "Chrome Extension", "Fly.io"],
      suggestedQuestion: "How does the cache avoid reprocessing the same email?",
    },
    interlude: {
      summary:
        "A reverse proxy and API gateway built from scratch in Go to explore concurrency, resilience, and observability.",
      stack: ["Go", "Standard library", "Prometheus", "Docker"],
      suggestedQuestion:
        "How do the circuit breaker and health checks work together?",
    },
    encore: {
      summary:
        "The SPA behind this interactive portfolio, with a serverless proxy that keeps the API key out of the browser.",
      stack: ["React", "TypeScript", "Vite", "Cloudflare Pages"],
      suggestedQuestion: "How is the API key kept out of the browser?",
    },
  },
};
