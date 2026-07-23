# Decisões de arquitetura

Formato: contexto → decisão → alternativas descartadas e por quê. Adicionar uma entrada
por decisão relevante; não editar entradas antigas, só adicionar novas (ou marcar como
superada, referenciando a que substituiu).

## Fechadas

### Stack: React + Vite

Contexto: o objetivo deste frontend é expor bem o projeto de portfólio, gastando o mínimo
de esforço/tempo possível — diferente do backend (`overture`), que é o projeto de
aprendizado. Desempenho bruto entre as opções avaliadas é irrelevante nesta escala de
tráfego (portfólio, poucos visitantes simultâneos).

Decisão: React + Vite (SPA simples, sem framework full-stack).

Descartadas:

- **Vanilla JS + Astro** — mais aprendizado de fundamentos e mais alinhado à filosofia
  "sem mágica" do backend, mas exige escrever manualmente gerência de estado/DOM da UI de
  chat; não vale o tempo dado que o frontend não é objetivo de aprendizado aqui.
- **Next.js** — API routes embutidas resolveriam o proxy da key sem função serverless
  separada, mas é mais framework do que o necessário para uma SPA simples.

### Proxy da API key: função serverless separada

Contexto: a `X-API-Key` da overture-api é única e compartilhada; não pode aparecer no
bundle do browser.

Decisão: uma função serverless própria deste projeto (Vercel Function ou Cloudflare
Worker) expõe `POST /api/ask` e `GET /api/repos`, repassando pra overture-api com a
`X-API-Key` injetada no lado do servidor. Como o browser fala só com essa função (mesma
origem do frontend), CORS não é um problema.

### Trajectory visível desde a v1

Contexto: o `trajectory` do `/ask` mostra as ferramentas que o agente usou pra responder
— é o principal diferencial de portfólio.

Decisão: exibir isso já na primeira versão, não como melhoria futura.

### Hosting: Cloudflare Pages + Workers

Contexto: o frontend precisa de hosting estático + uma função serverless (proxy da
`X-API-Key`), e a decisão de rate limiting depende do que a plataforma oferece nativo.

Decisão: Cloudflare Pages, com a função de proxy como Pages Function (Workers). Motivo
decisivo: rate limiting binding e KV são nativos e gratuitos — a proteção de custo não
exige nenhum serviço externo, alinhado ao "simplicidade antes de abstração".

Descartadas:

- **Vercel** — melhor DX, mas rate limiting persistente exigiria Upstash Redis/Vercel KV
  como dependência externa só pra isso.
- **Netlify** — mesma limitação da Vercel, sem vantagem compensatória.

Trade-off aceito: DX um pouco menos polida (wrangler) e runtime V8 isolates em vez de
Node — irrelevante pra um proxy que só faz `fetch`.

### Rate limiting: por IP + teto global diário

Contexto: cada `POST /ask` custa dinheiro real (LLM no backend); página pública sem
controle de acesso. O risco a mitigar é custo descontrolado, não indisponibilidade.

Decisão: dois níveis na função serverless — limite por IP (ex. 5 req/min via rate
limiting binding do Workers) + teto global diário de asks (ex. 200/dia, contador em
Workers KV; estourou → 429 com mensagem amigável). Números exatos ajustáveis na
implementação. Só o teto global limita o pior caso de gasto em valor absoluto.

Descartadas:

- **Só por IP** — não protege contra abuso distribuído; gasto sem teto.
- **IP + teto + Turnstile (CAPTCHA)** — máxima proteção, mas atrito e código extras;
  exagero pra vitrine de baixo tráfego.

### Rate limit implementado 100% em KV (não no rate limiting binding)

Contexto: a decisão anterior citava o rate limiting binding do Workers como exemplo para
o limite por IP, mas o binding não está disponível em Pages Functions.

Decisão: as duas camadas (IP/min e teto diário) vivem em Workers KV, com janelas fixas
(`ip:<ip>:<minuto>` e `global:<dia>`) e TTL nativo. Trade-offs aceitos, ambos
irrelevantes nesta escala: consistência eventual do KV (rajada pode furar o limite por
segundos) e janela fixa (rajada na virada do minuto pode passar até 2× o limite —
observado e confirmado em produção durante a validação).

Descartada: migrar de Pages para Worker com static assets só para ter o binding nativo
— mais mudança de infra do que o benefício justifica.

## Em aberto (resolver com o usuário antes de codar)

(nenhuma no momento)

## Sprint de modernização da UI

### Navegação: rotas reais com Wouter

Contexto: a nova página About precisa de navegação clara nos dois sentidos e URLs
compartilháveis, sem transformar a SPA pequena em uma aplicação com infraestrutura de
roteamento pesada.

Decisão: usar Wouter com `/` para About e `/chat` para a experiência de projetos. O
carregamento de repositórios fica restrito à rota de chat.

Descartada: controlar a tela apenas em estado local — eliminaria uma dependência, mas
não permitiria compartilhar ou recarregar uma tela específica.

### Descrições de projetos: conteúdo estático indexado por repo_id

Contexto: o contrato de `GET /repos` expõe apenas `repo_id` e `display_name`.

Decisão: manter descrições editoriais em um módulo TypeScript do frontend, indexadas por
`repo_id`, e omitir o bloco quando o backend retornar um projeto ainda não descrito.

Descartada: ampliar o contrato da API — o backend está fora de escopo e o conteúdo é
específico deste portfólio.

### Markdown: react-markdown sem HTML cru

Contexto: respostas do agente contêm markdown útil, mas são conteúdo não confiável
gerado por LLM.

Decisão: renderizar somente mensagens do agente com `react-markdown`, sem `rehype-raw` e
com HTML cru explicitamente ignorado. Mensagens do visitante continuam como texto puro.
O custo no bundle será medido contra a linha de base de 194,60 kB JS (61,67 kB gzip).

Descartado: parser próprio — menor bundle potencial, mas aumenta a superfície de bugs e
segurança para reproduzir um formato já padronizado.

### Internacionalização: contexto React e dicionários tipados

Contexto: a interface e cada resposta do agente precisam alternar entre `pt-BR` e `en`
por requisição, preservando conversa, `thread_id` e projeto selecionado.

Decisão: usar um contexto React leve para a preferência de idioma e dicionários
TypeScript separados por locale, validados por uma interface comum. A preferência fica
em `localStorage`; o contexto também atualiza o atributo `lang` e a descrição da
página. O chat lê o idioma no envio, sem ser remontado ao alternar o controle.

Descartado: adicionar `react-i18next` — a aplicação tem dois idiomas, poucas rotas e
nenhuma necessidade atual de carregamento remoto, namespaces ou pluralização
avançada; a dependência aumentaria o bundle e a configuração sem benefício
proporcional.
