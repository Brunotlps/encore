# encore

Frontend React + Vite para um portfólio interativo: o visitante escolhe um projeto
cadastrado e conversa com o agente Q&A da `overture-api` sobre o código daquele projeto.
Este repositório é só o frontend — a API (`overture`) é um contrato fixo, não se modifica
aqui. Contrato completo em `docs/api-contract.md`; decisões já fechadas e trade-offs em
`docs/decisions.md`. Leia os dois antes de propor qualquer mudança de arquitetura.

## Regras não negociáveis

- **A chave `X-API-Key` da overture-api nunca chega ao browser.** Todo request pra API
  passa por uma função serverless própria deste projeto, que injeta a chave no lado do
  servidor. Nunca use um prefixo de env var que vaza pro bundle do cliente
  (`VITE_*` client-side, `NEXT_PUBLIC_*`, etc.) para essa chave.
- Simplicidade antes de abstração: isto é uma vitrine de portfólio de baixo tráfego, não
  um produto com pressão de escala. Não adicione autenticação de usuários, multi-tenant,
  filas, ou infraestrutura que a issue/tarefa não pediu.

## Como colaborar

- Explique o problema e os trade-offs antes de implementar; espere confirmação antes de
  decisões de arquitetura ou escopo. Perguntas exploratórias merecem resposta curta com
  recomendação + principal trade-off, não um documento.
- Para features não triviais, pergunte se o usuário quer TDD (RED → GREEN por ciclo, um
  commit por ciclo) antes de escrever tudo de uma vez.
- Nunca commite, abra PR ou faça merge sem autorização explícita.
- Commits: mensagem simples, uma linha, sem `Co-Authored-By`/menção a IA.
- Ao esperar CI, confira uma vez só — nunca fique em loop de polling.
- Issues, labels, PRs e qualquer artefato do GitHub sempre em inglês, mesmo que a
  conversa seja em português.
- Ao final de cada decisão de arquitetura relevante, registre em `docs/decisions.md`
  (formato ADR curto: contexto, decisão, alternativas descartadas e por quê).

## Primeiro passo

Não comece a codar. As decisões de hosting (Vercel/Netlify/Cloudflare Pages) e de
rate-limiting da função serverless (ver `docs/decisions.md`, seção "Em aberto") ainda não
estão fechadas — proponha opções e trade-offs, espere o usuário decidir, registre a
decisão em `docs/decisions.md`, só então monte um plano de estrutura do projeto para
aprovação antes do primeiro código.
