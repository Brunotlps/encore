import type { Env } from "../types";

// Sem rate limit: GET /repos não custa LLM e o resultado é praticamente estático.
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const upstream = await fetch(`${env.OVERTURE_API_BASE_URL}/repos`, {
    headers: { "X-API-Key": env.OVERTURE_API_KEY },
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
};
