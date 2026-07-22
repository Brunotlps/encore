// Bindings disponíveis nas Pages Functions — ver wrangler.toml.
export interface Env {
  OVERTURE_API_BASE_URL: string;
  OVERTURE_API_KEY: string;
  RATE_LIMIT_KV: KVNamespace;
}
