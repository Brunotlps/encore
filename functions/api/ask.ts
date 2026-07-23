import type { Env } from "../types";
import { checkRateLimit } from "./_lib/rateLimit";

// Números da decisão em docs/decisions.md ("Rate limiting") — ajustáveis.
const RATE_LIMIT = { perIpPerMinute: 5, globalPerDay: 200 };

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const verdict = await checkRateLimit(env.RATE_LIMIT_KV, ip, new Date(), RATE_LIMIT);

  if (!verdict.allowed) {
    const detail =
      verdict.reason === "global"
        ? "O limite diário de perguntas do site foi atingido — volte amanhã!"
        : "Muitas perguntas em sequência — aguarde um minuto e tente de novo.";
    return Response.json({ detail }, { status: 429 });
  }

  // Proxy transparente: corpo e status repassados; a key só existe aqui.
  const upstream = await fetch(`${env.OVERTURE_API_BASE_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": env.OVERTURE_API_KEY,
    },
    body: await request.text(),
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
};
