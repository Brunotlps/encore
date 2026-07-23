import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../types";
import { onRequestGet } from "./repos";

function makeContext() {
  const env = {
    OVERTURE_API_BASE_URL: "https://overture.example",
    OVERTURE_API_KEY: "secret-key",
    RATE_LIMIT_KV: {} as KVNamespace,
  } satisfies Env;
  const request = new Request("https://encore.example/api/repos");
  return { request, env } as Parameters<typeof onRequestGet>[0];
}

const upstreamRepos = [{ repo_id: "overture", display_name: "Overture" }];

describe("GET /api/repos", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json(upstreamRepos)),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("busca a lista no upstream com a X-API-Key injetada", async () => {
    await onRequestGet(makeContext());

    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(url).toBe("https://overture.example/repos");
    expect(new Headers(init?.headers).get("X-API-Key")).toBe("secret-key");
  });

  it("devolve a lista do upstream", async () => {
    const response = await onRequestGet(makeContext());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(upstreamRepos);
  });

  it("repassa status de erro do upstream", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({ detail: "Invalid or missing API key" }, { status: 401 }),
    );
    const response = await onRequestGet(makeContext());
    expect(response.status).toBe(401);
  });
});
