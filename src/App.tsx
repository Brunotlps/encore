import { useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { fetchRepos, type Repo } from "./api";
import { Chat } from "./components/Chat";
import { ProjectDescription } from "./components/ProjectDescription";
import { RepoSelector } from "./components/RepoSelector";

function Wordmark() {
  return (
    <Link href="/" className="wordmark" aria-label="Encore — página inicial">
      enc<span className="wordmark-accent">o</span>re
    </Link>
  );
}

function SiteHeader() {
  const [location] = useLocation();
  const isProjects = location === "/chat";

  return (
    <header className="site-header">
      <Wordmark />
      <nav aria-label="Navegação principal">
        <Link href="/" aria-current={!isProjects ? "page" : undefined}>
          Sobre
        </Link>
        <Link href="/chat" aria-current={isProjects ? "page" : undefined}>
          Projetos
        </Link>
      </nav>
    </header>
  );
}

function SocialLinks() {
  return (
    <nav className="profile-links" aria-label="Links profissionais">
      <a
        href="https://www.linkedin.com/in/brunotlps/"
        target="_blank"
        rel="noreferrer"
        aria-label="LinkedIn"
        title="LinkedIn"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M6.4 8.4H3.2V20h3.2V8.4ZM4.8 3A1.9 1.9 0 1 0 4.8 6.8 1.9 1.9 0 0 0 4.8 3ZM20.8 13.3c0-3.5-1.9-5.2-4.4-5.2a4 4 0 0 0-3.6 2v-1.7H9.6V20h3.2v-5.8c0-1.5.3-3 2.2-3s2 1.7 2 3.1V20h3.2l.6-6.7Z" />
        </svg>
      </a>
      <a
        href="https://www.99freelas.com.br/user/brunotlps"
        target="_blank"
        rel="noreferrer"
        aria-label="99Freelas"
        title="99Freelas"
      >
        <span className="freelas-monogram" aria-hidden="true">
          99
        </span>
      </a>
    </nav>
  );
}

function AboutPage() {
  return (
    <section className="about" aria-labelledby="about-title">
      <div className="about-hero">
        <p className="eyebrow">Bruno Teixeira · Backend Engineer</p>
        <h1 id="about-title">
          Backend, APIs e agentes de IA construídos para funcionar em produção.
        </h1>
        <p className="about-lead">
          Sou desenvolvedor backend com foco em Python (Django/FastAPI) e Go.
          Desenvolvo e opero APIs e sistemas com LLMs, da arquitetura ao deploy, com
          foco em testes automatizados, segurança e observabilidade. Também contribuo
          para projetos open source, incluindo o Caddy.
        </p>
        <div className="profile-actions">
          <a
            href="https://github.com/Brunotlps"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <SocialLinks />
        </div>
      </div>

      <article className="about-encore" aria-labelledby="encore-title">
        <header className="encore-intro">
          <p className="eyebrow">Como funciona</p>
          <h2 id="encore-title">Um portfólio que responde.</h2>
          <p>
            O Encore é um portfólio interativo que transforma meus repositórios em
            uma experiência de exploração. Em vez de apenas listar projetos, ele
            permite investigar decisões de arquitetura, implementação, testes e
            segurança conversando diretamente sobre o código.
          </p>
          <p className="encore-highlight">
            Não é um chat genérico: cada resposta parte do projeto selecionado e vem
            acompanhada das ferramentas que o agente usou para encontrá-la.
          </p>
        </header>

        <ol className="encore-steps" aria-label="Como o Encore funciona">
          <li>
            <span aria-hidden="true">01</span>
            <h3>Escolha um projeto</h3>
            <p>Conheça a stack, o propósito e sugestões do que explorar.</p>
          </li>
          <li>
            <span aria-hidden="true">02</span>
            <h3>Pergunte ao código</h3>
            <p>O agente busca arquivos e trechos relevantes no repositório.</p>
          </li>
          <li>
            <span aria-hidden="true">03</span>
            <h3>Acompanhe o percurso</h3>
            <p>Veja as ferramentas consultadas junto da resposta em markdown.</p>
          </li>
        </ol>

        <div className="encore-architecture" aria-label="Arquitetura do Encore">
          <div>
            <span>Interface</span>
            <strong>Encore</strong>
            <p>React, TypeScript, Vite e Cloudflare Pages.</p>
          </div>
          <span className="architecture-connector" aria-hidden="true">
            →
          </span>
          <div>
            <span>Agente</span>
            <strong>Overture</strong>
            <p>Python, FastAPI, LangGraph e ferramentas de leitura do código.</p>
          </div>
        </div>

        <p className="encore-security">
          Uma função serverless faz a ponte entre os dois sem expor a chave da API no
          navegador.
        </p>

        <footer className="encore-action">
          <div>
            <p className="eyebrow">Experimente agora</p>
            <p>Escolha um projeto e faça sua primeira pergunta.</p>
          </div>
          <Link href="/chat" className="primary-link">
            Conversar sobre os projetos
          </Link>
        </footer>
      </article>
    </section>
  );
}

function ProjectsPage() {
  const [repos, setRepos] = useState<Repo[] | null>(null); // null = carregando
  const [selected, setSelected] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRepos()
      .then((list) => {
        if (cancelled) return;
        setRepos(list);
        setSelected(list[0]?.repo_id ?? null);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedRepo = repos?.find((repo) => repo.repo_id === selected);

  return (
    <section className="projects" aria-labelledby="projects-title">
      <header className="app-header">
        <p className="eyebrow">Explore o código</p>
        <h1 id="projects-title">Converse com os projetos.</h1>
        <p>Faça uma pergunta e acompanhe a investigação do agente.</p>
      </header>

      {repos === null && !failed && (
        <p role="status" className="repos-loading">
          Carregando projetos…
        </p>
      )}

      {failed && (
        <p role="alert">Não consegui carregar a lista de projetos — recarregue a página.</p>
      )}

      {repos?.length === 0 && (
        <p className="app-empty">
          Nenhum projeto disponível no momento — volte em breve.
        </p>
      )}

      {repos && selected && selectedRepo && (
        <>
          <RepoSelector repos={repos} selected={selected} onSelect={setSelected} />
          <ProjectDescription repo={selectedRepo} />
          <Chat repoId={selected} />
        </>
      )}
    </section>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="app">
        <Switch>
          <Route path="/chat" component={ProjectsPage} />
          <Route component={AboutPage} />
        </Switch>
      </main>
    </div>
  );
}
