import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ask, fetchRepos } from "./api";

const askResponse = {
  answer: "resposta",
  trajectory: [{ tool: "grep_repo", tool_input: "x", output_summary: "y" }],
  iterations: 2,
  thread_id: "t-1",
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(askResponse)),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchRepos", () => {
  it("busca GET /api/repos e devolve a lista", async () => {
    const repos = [{ repo_id: "overture", display_name: "Overture" }];
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(repos));

    await expect(fetchRepos()).resolves.toEqual(repos);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith("/api/repos");
  });
});

describe("ask", () => {
  it("posta question, repo_id e language, omitindo thread_id na primeira pergunta", async () => {
    await ask({
      question: "Como funciona?",
      repoId: "overture",
      language: "pt-BR",
    });

    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/ask");
    expect(init?.method).toBe("POST");
    const body = JSON.parse(init?.body as string);
    expect(body).toEqual({
      question: "Como funciona?",
      repo_id: "overture",
      language: "pt-BR",
    });
    expect("thread_id" in body).toBe(false);
  });

  it("inclui thread_id e permite trocar o idioma nas perguntas seguintes", async () => {
    await ask({
      question: "What next?",
      repoId: "overture",
      threadId: "t-1",
      language: "en",
    });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(JSON.parse(init?.body as string)).toEqual({
      question: "What next?",
      repo_id: "overture",
      thread_id: "t-1",
      language: "en",
    });
  });

  it("devolve a resposta tipada do agente", async () => {
    await expect(
      ask({
        question: "Como funciona?",
        repoId: "overture",
        language: "pt-BR",
      }),
    ).resolves.toEqual(askResponse);
  });

  it("lança ApiError com status e detail do backend em não-2xx", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ detail: "volte amanhã" }, { status: 429 }),
    );

    const error = await ask({
      question: "Oi?",
      repoId: "overture",
      language: "pt-BR",
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(429);
    expect((error as ApiError).detail).toBe("volte amanhã");
  });

  it("usa mensagem genérica quando detail não é string (422 do FastAPI)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json(
        { detail: [{ type: "string_too_short", loc: ["body", "question"] }] },
        { status: 422 },
      ),
    );

    const error = await ask({
      question: "Oi?",
      repoId: "overture",
      language: "pt-BR",
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).detail).toMatch(/inesperado/i);
  });

  it("usa mensagem genérica quando o corpo de erro não é JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("<html>gateway error</html>", { status: 502 }),
    );

    const error = await ask({
      question: "Oi?",
      repoId: "overture",
      language: "pt-BR",
    }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(502);
    expect((error as ApiError).detail).toMatch(/inesperado/i);
  });
});
