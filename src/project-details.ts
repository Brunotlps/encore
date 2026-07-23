export interface ProjectDetails {
  summary: string;
  stack: string[];
  suggestedQuestion: string;
}

const PROJECT_DETAILS: Record<string, ProjectDetails> = {
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
    suggestedQuestion: "Como a máquina de estados protege as transições de pedido?",
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
};

export function getProjectDetails(repoId: string): ProjectDetails | undefined {
  return PROJECT_DETAILS[repoId];
}
