# Contrato da overture-api

Autoritativo — não invente campos além dos listados aqui. Produção:
`https://overture-prod.fly.dev`. Repositório do backend (NUNCA modificar):
`~/workspace/active/overture` — peça ao usuário se precisar ler algo de lá.
Recomendo ler `~/workspace/active/overture/docs` para total entendimento do backend

## Autenticação

Toda rota exceto `/health` exige o header `X-API-Key: <chave>`.

- Falta ou chave errada → `401 {"detail": "Invalid or missing API key"}`.
- Servidor sem chave configurada → `503` (não deve acontecer em produção).
- A chave é secreta: só existe como env var da função serverless deste projeto, nunca no
  bundle do cliente. Ver regra correspondente em `CLAUDE.md`.

## `GET /repos`

Lista os projetos disponíveis para o seletor.

```json
[{"repo_id": "overture", "display_name": "Overture"}]
```

## `POST /ask`

Request:

```json
{
  "question": "string, 3 a 500 caracteres, obrigatório",
  "thread_id": "string opcional, max 100 chars — omita na primeira pergunta; reenvie o valor recebido na resposta anterior para continuar a mesma conversa",
  "repo_id": "string opcional — um repo_id de GET /repos; este frontend sempre envia o repo_id escolhido pelo visitante",
  "language": "'pt-BR' ou 'en', opcional, padrão 'pt-BR'; este frontend sempre envia o idioma escolhido pelo visitante"
}
```

Response (200):

```json
{
  "answer": "string — resposta final do agente",
  "trajectory": [
    {"tool": "grep_repo", "tool_input": "...", "output_summary": "..."},
    {"tool": "read_file", "tool_input": "...", "output_summary": "..."}
  ],
  "iterations": 3,
  "thread_id": "string — guardar para as próximas perguntas da mesma conversa"
}
```

- trajectory é o principal diferencial de portfólio deste frontend: exibir de forma
visível (ex. lista colapsável "🔍 grep_repo → 📄 read_file → 💬 resposta"), não só a
answer.
- `language` é por requisição: pode mudar dentro da mesma conversa sem trocar o
  `thread_id`; outro valor além de `pt-BR` ou `en` → 422.
- Body com campo extra além de question/thread_id/repo_id/language → 422 (schema é
extra="forbid").
- repo_id desconhecido → 404 {"detail": "Unknown repo_id: <valor>"}.
- Erro inesperado no agente → 500 {"detail": "Unexpected error running the agent"}.
- O `detail` dos erros permanece em inglês. A UI localiza por status: 404 para
  projeto desconhecido, 422 para validação e 500 para falha genérica.
- Sem streaming — a resposta só chega completa no fim, pode levar alguns segundos; a UI
precisa de um estado de carregamento claro durante a espera.

Regras de negócio para a UI

1. thread_id e repo_id não são cross-validados pelo backend. Na prática, cada
projeto do seletor deve ter conversa isolada: ao trocar de projeto, gere/limpe o
thread_id — não reaproveite o de outro repo_id. Guardar {repo_id: thread_id} no
estado do cliente (ex. sessionStorage), um por projeto visitado na sessão.
2. Sem persistência de conversa entre reinícios do backend (MemorySaver em memória,
Fly escala a zero) — sempre comece com thread_id omitido na primeira pergunta de uma
sessão nova.
3. Estouro de orçamento de tool calls do agente ainda retorna answer preenchida — não é
um erro HTTP, é resposta normal; não tratar como caso de exceção na UI.
