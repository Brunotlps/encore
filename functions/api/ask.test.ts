import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../types";
import { onRequestPost } from "./ask";

function fakeKv() {
  const data = new Map<string, string>();
  return {
    get: async (key: string) => data.get(key) ?? null,
    put: async (key: string, value: string) => {
      data.set(key, value);
    },
  } as unknown as KVNamespace;
}

function makeContext(overrides: { ip?: string; kv?: KVNamespace; body?: unknown } = {}) {
  const request = new Request("https://encore.example/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CF-Connecting-IP": overrides.ip ?? "1.2.3.4",
    },
    body: JSON.stringify(overrides.body ?? { question: "Como funciona o agente?" }),
  });
  const env: Env = {
    OVERTURE_API_BASE_URL: "https://overture.example",
    OVERTURE_API_KEY: "secret-key",
    RATE_LIMIT_KV: overrides.kv ?? fakeKv(),
  };
  return { request, env } as Parameters<typeof onRequestPost>[0];
}

const upstreamAnswer = {
  answer: "resposta",
  trajectory: [],
  iterations: 1,
  thread_id: "t-1",
};

describe("POST /api/ask", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(upstreamAnswer)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("repassa o body pra overture-api com a X-API-Key injetada", async () => {
    const body = { question: "O que faz o grep_repo?", repo_id: "overture" };
    await onRequestPost(makeContext({ body }));

    const fetchMock = vi.mocked(fetch);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://overture.example/ask");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("X-API-Key")).toBe("secret-key");
    expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(init?.body as string)).toEqual(body);
  });

  it("devolve a resposta 200 do upstream", async () => {
    const response = await onRequestPost(makeContext());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(upstreamAnswer);
  });

  it("repassa status de erro do upstream (ex. 422)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ detail: "validation error" }, { status: 422 }),
    );
    const response = await onRequestPost(makeContext());
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({ detail: "validation error" });
  });

  it("responde 429 quando o IP passa do limite por minuto", async () => {
    const kv = fakeKv();
    let response: Response | undefined;
    for (let i = 0; i < 6; i++) {
      response = await onRequestPost(makeContext({ kv, ip: "9.9.9.9" }));
    }
    expect(response!.status).toBe(429);
    const body = (await response!.json()) as { detail: string };
    expect(body.detail).toMatch(/aguarde/i);
  });

  it("responde 429 com mensagem própria quando o teto global do dia estoura", async () => {
    const kv = fakeKv();
    await kv.put(`global:${new Date().toISOString().slice(0, 10)}`, "200");
    const response = await onRequestPost(makeContext({ kv }));
    expect(response.status).toBe(429);
    const body = (await response.json()) as { detail: string };
    expect(body.detail).toMatch(/amanh/i);
  });

  it("não chama o upstream quando barrada pelo rate limit", async () => {
    const kv = fakeKv();
    await kv.put(`global:${new Date().toISOString().slice(0, 10)}`, "200");
    await onRequestPost(makeContext({ kv }));
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });
});
