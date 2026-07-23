import { describe, expect, it } from "vitest";
import { checkRateLimit, type RateLimitStore } from "./rateLimit";

function fakeStore(): RateLimitStore {
  const data = new Map<string, string>();
  return {
    get: async (key) => data.get(key) ?? null,
    put: async (key, value) => {
      data.set(key, value);
    },
  };
}

const config = { perIpPerMinute: 5, globalPerDay: 200 };
const now = new Date("2026-07-22T12:00:30Z");

describe("checkRateLimit", () => {
  it("permite a primeira request de um IP", async () => {
    const store = fakeStore();
    const result = await checkRateLimit(store, "1.2.3.4", now, config);
    expect(result).toEqual({ allowed: true });
  });

  it("bloqueia o IP acima do limite por minuto", async () => {
    const store = fakeStore();
    for (let i = 0; i < config.perIpPerMinute; i++) {
      await checkRateLimit(store, "1.2.3.4", now, config);
    }
    const result = await checkRateLimit(store, "1.2.3.4", now, config);
    expect(result).toEqual({ allowed: false, reason: "ip" });
  });

  it("conta IPs separadamente", async () => {
    const store = fakeStore();
    for (let i = 0; i < config.perIpPerMinute; i++) {
      await checkRateLimit(store, "1.2.3.4", now, config);
    }
    const result = await checkRateLimit(store, "5.6.7.8", now, config);
    expect(result).toEqual({ allowed: true });
  });

  it("reseta o limite por IP na janela de minuto seguinte", async () => {
    const store = fakeStore();
    for (let i = 0; i < config.perIpPerMinute; i++) {
      await checkRateLimit(store, "1.2.3.4", now, config);
    }
    const nextMinute = new Date("2026-07-22T12:01:05Z");
    const result = await checkRateLimit(store, "1.2.3.4", nextMinute, config);
    expect(result).toEqual({ allowed: true });
  });

  it("bloqueia qualquer IP quando o teto global diário estoura", async () => {
    const store = fakeStore();
    const small = { perIpPerMinute: 100, globalPerDay: 3 };
    for (let i = 0; i < small.globalPerDay; i++) {
      await checkRateLimit(store, `10.0.0.${i}`, now, small);
    }
    const result = await checkRateLimit(store, "99.99.99.99", now, small);
    expect(result).toEqual({ allowed: false, reason: "global" });
  });

  it("reseta o teto global no dia seguinte", async () => {
    const store = fakeStore();
    const small = { perIpPerMinute: 100, globalPerDay: 3 };
    for (let i = 0; i < small.globalPerDay; i++) {
      await checkRateLimit(store, `10.0.0.${i}`, now, small);
    }
    const nextDay = new Date("2026-07-23T00:00:10Z");
    const result = await checkRateLimit(store, "99.99.99.99", nextDay, small);
    expect(result).toEqual({ allowed: true });
  });

  it("request bloqueada por IP não consome o teto global", async () => {
    const store = fakeStore();
    const small = { perIpPerMinute: 1, globalPerDay: 2 };
    await checkRateLimit(store, "1.2.3.4", now, small); // 1/2 do global
    await checkRateLimit(store, "1.2.3.4", now, small); // bloqueada por IP
    await checkRateLimit(store, "1.2.3.4", now, small); // bloqueada por IP
    const result = await checkRateLimit(store, "5.6.7.8", now, small);
    expect(result).toEqual({ allowed: true }); // global chega a 2/2 só agora
  });
});
