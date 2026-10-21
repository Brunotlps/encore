Frontend do portfólio interativo — conversa com o agente Q&A da
[`overture`](https://overture-prod.fly.dev) sobre os projetos cadastrados.

**No ar:** https://encore-c6m.pages.dev

## Desenvolvimento

```bash
npm install
npm test              # vitest
npm run dev           # só o frontend (sem /api)
npm run build         # tsc + vite build
npm run preview       # build servido pelo wrangler com as functions (usa .dev.vars)
npm run deploy        # build + deploy no Cloudflare Pages
```

Para o `preview` funcionar, copie `.dev.vars.example` para `.dev.vars` e preencha a
`OVERTURE_API_KEY`.

Ver `CLAUDE.md` para regras de colaboração e `docs/` para contrato de API e decisões de
arquitetura.

---

Interactive portfolio frontend — chat with the Q&A agent from
[`overture`](https://overture-prod.fly.dev) about the registered projects.

**Live:** https://encore-c6m.pages.dev

## Development

```bash
npm install
npm test              # Run tests with Vitest
npm run dev           # Frontend only (without /api)
npm run build         # TypeScript check + Vite build
npm run preview       # Serve build with Wrangler and Functions (uses .dev.vars)
npm run deploy        # Build + deploy to Cloudflare Pages
```

For `preview` to work, copy `.dev.vars.example` to `.dev.vars` and set
the `OVERTURE_API_KEY`.

See `CLAUDE.md` for collaboration guidelines and `docs/` for the API contract
and architectural decisions.

