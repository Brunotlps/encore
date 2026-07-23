// Rate limit em duas camadas sobre KV — ver docs/decisions.md ("Rate limiting").
// KV é eventualmente consistente: uma rajada pode furar o limite por segundos,
// aceitável para o custo que estamos protegendo.

// Subconjunto de KVNamespace que usamos — permite um fake em memória nos testes.
export interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
}

export interface RateLimitConfig {
  perIpPerMinute: number;
  globalPerDay: number;
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "ip" | "global" };

export async function checkRateLimit(
  store: RateLimitStore,
  ip: string,
  now: Date,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const minute = now.toISOString().slice(0, 16); // 2026-07-22T12:00
  const day = now.toISOString().slice(0, 10); // 2026-07-22
  const ipKey = `ip:${ip}:${minute}`;
  const globalKey = `global:${day}`;

  // IP primeiro: request barrada por IP não deve consumir o teto global.
  const ipCount = Number((await store.get(ipKey)) ?? 0);
  if (ipCount >= config.perIpPerMinute) {
    return { allowed: false, reason: "ip" };
  }

  const globalCount = Number((await store.get(globalKey)) ?? 0);
  if (globalCount >= config.globalPerDay) {
    return { allowed: false, reason: "global" };
  }

  // get+put não é atômico — sob concorrência o contador pode subcontar. Ok aqui.
  await store.put(ipKey, String(ipCount + 1), { expirationTtl: 120 });
  await store.put(globalKey, String(globalCount + 1), {
    expirationTtl: 60 * 60 * 48,
  });
  return { allowed: true };
}
