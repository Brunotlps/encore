// Cliente do proxy /api/* — tipos espelham docs/api-contract.md.

export interface Repo {
  repo_id: string;
  display_name: string;
}

export interface TrajectoryStep {
  tool: string;
  tool_input: string;
  output_summary: string;
}

export interface AskResponse {
  answer: string;
  trajectory: TrajectoryStep[];
  iterations: number;
  thread_id: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const fallback = "Erro inesperado — tente de novo em instantes.";
  // detail nem sempre é string: o 422 do FastAPI manda um array de objetos.
  const detail = await response
    .json()
    .then((body) => {
      const raw = (body as { detail?: unknown }).detail;
      return typeof raw === "string" ? raw : fallback;
    })
    .catch(() => fallback);
  return new ApiError(response.status, detail);
}

export async function fetchRepos(): Promise<Repo[]> {
  const response = await fetch("/api/repos");
  if (!response.ok) throw await toApiError(response);
  return response.json();
}

export async function ask(params: {
  question: string;
  repoId: string;
  threadId?: string;
}): Promise<AskResponse> {
  // Upstream é extra="forbid": thread_id undefined precisa sumir do JSON,
  // não virar null — JSON.stringify já omite chaves undefined.
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: params.question,
      repo_id: params.repoId,
      thread_id: params.threadId,
    }),
  });
  if (!response.ok) throw await toApiError(response);
  return response.json();
}
