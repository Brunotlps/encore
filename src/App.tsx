import { useEffect, useState } from "react";
import { Link, Route, Switch } from "wouter";
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
        <div className="about-actions">
          <Link href="/chat" className="primary-link">
            Conversar sobre os projetos
          </Link>
          <a
            href="https://github.com/Brunotlps"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>

      <article className="about-encore" aria-labelledby="encore-title">
        <p className="eyebrow">Como funciona</p>
        <h2 id="encore-title">Um portfólio que responde.</h2>
        <p>
          O Encore é um portfólio interativo: em vez de apenas listar projetos, ele
          permite conversar sobre o código deles. Você escolhe um repositório e faz
          perguntas; o Overture, agente de IA que funciona nos bastidores, investiga
          os arquivos e apresenta tanto a resposta quanto o caminho percorrido para
          encontrá-la.
        </p>
      </article>

      <nav className="profile-links" aria-label="Links profissionais">
        <a
          href="https://www.linkedin.com/in/brunotlps/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <a
          href="https://www.99freelas.com.br/user/brunotlps"
          target="_blank"
          rel="noreferrer"
        >
          99Freelas
        </a>
      </nav>
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
      <header className="site-header">
        <Wordmark />
        <nav aria-label="Navegação principal">
          <Link href="/">Sobre</Link>
          <Link href="/chat">Projetos</Link>
        </nav>
      </header>

      <main className="app">
        <Switch>
          <Route path="/chat" component={ProjectsPage} />
          <Route component={AboutPage} />
        </Switch>
      </main>
    </div>
  );
}
