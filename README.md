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
