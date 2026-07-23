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
  it("posta question e repo_id, omitindo thread_id na primeira pergunta", async () => {
    await ask({ question: "Como funciona?", repoId: "overture" });

    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("/api/ask");
    expect(init?.method).toBe("POST");
    const body = JSON.parse(init?.body as string);
    expect(body).toEqual({ question: "Como funciona?", repo_id: "overture" });
    expect("thread_id" in body).toBe(false);
  });

  it("inclui thread_id nas perguntas seguintes", async () => {
    await ask({ question: "E depois?", repoId: "overture", threadId: "t-1" });

    const [, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(JSON.parse(init?.body as string)).toEqual({
      question: "E depois?",
      repo_id: "overture",
      thread_id: "t-1",
    });
  });

  it("devolve a resposta tipada do agente", async () => {
    await expect(
      ask({ question: "Como funciona?", repoId: "overture" }),
    ).resolves.toEqual(askResponse);
  });

  it("lança ApiError com status e detail do backend em não-2xx", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ detail: "volte amanhã" }, { status: 429 }),
    );

    const error = await ask({ question: "Oi?", repoId: "overture" }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(429);
    expect((error as ApiError).detail).toBe("volte amanhã");
  });

  it("usa mensagem genérica quando o corpo de erro não é JSON", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response("<html>gateway error</html>", { status: 502 }),
    );

    const error = await ask({ question: "Oi?", repoId: "overture" }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(502);
    expect((error as ApiError).detail).toMatch(/inesperado/i);
  });
});
