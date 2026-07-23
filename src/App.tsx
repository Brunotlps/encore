import { useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { fetchRepos, type Repo } from "./api";
import { Chat } from "./components/Chat";
import { LanguageToggle } from "./components/LanguageToggle";
import { ProjectDescription } from "./components/ProjectDescription";
import { RepoSelector } from "./components/RepoSelector";
import { I18nProvider, useI18n } from "./i18n/I18nProvider";

function Wordmark() {
  const { messages } = useI18n();

  return (
    <Link href="/" className="wordmark" aria-label={messages.header.homeAria}>
      enc<span className="wordmark-accent">o</span>re
    </Link>
  );
}

function SiteHeader() {
  const { messages } = useI18n();
  const [location] = useLocation();
  const isProjects = location === "/chat";

  return (
    <header className="site-header">
      <Wordmark />
      <div className="header-actions">
        <nav aria-label={messages.header.navigationAria}>
          <Link href="/" aria-current={!isProjects ? "page" : undefined}>
            {messages.header.about}
          </Link>
          <Link href="/chat" aria-current={isProjects ? "page" : undefined}>
            {messages.header.projects}
          </Link>
        </nav>
        <LanguageToggle />
      </div>
    </header>
  );
}

function SocialLinks() {
  const { messages } = useI18n();

  return (
    <nav
      className="profile-links"
      aria-label={messages.about.professionalLinksAria}
    >
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
  const { messages } = useI18n();
  const { encore } = messages.about;

  return (
    <section className="about" aria-labelledby="about-title">
      <div className="about-hero">
        <p className="eyebrow">{messages.about.role}</p>
        <h1 id="about-title">{messages.about.title}</h1>
        <p className="about-lead">{messages.about.bio}</p>
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
          <p className="eyebrow">{encore.eyebrow}</p>
          <h2 id="encore-title">{encore.title}</h2>
          <p>{encore.intro}</p>
          <p className="encore-highlight">{encore.highlight}</p>
        </header>

        <ol className="encore-steps" aria-label={encore.stepsAria}>
          {encore.steps.map((step, index) => (
            <li key={step.title}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="encore-architecture" aria-label={encore.architectureAria}>
          <div>
            <span>{encore.interfaceLabel}</span>
            <strong>Encore</strong>
            <p>{encore.interfaceDescription}</p>
          </div>
          <span className="architecture-connector" aria-hidden="true">
            →
          </span>
          <div>
            <span>{encore.agentLabel}</span>
            <strong>Overture</strong>
            <p>{encore.agentDescription}</p>
          </div>
        </div>

        <footer className="encore-action">
          <div>
            <p className="eyebrow">{encore.tryEyebrow}</p>
            <p>{encore.tryDescription}</p>
          </div>
          <Link href="/chat" className="primary-link">
            {encore.cta}
          </Link>
        </footer>
      </article>
    </section>
  );
}

function ProjectsPage() {
  const { messages } = useI18n();
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
        <p className="eyebrow">{messages.projects.eyebrow}</p>
        <h1 id="projects-title">{messages.projects.title}</h1>
        <p>{messages.projects.subtitle}</p>
      </header>

      {repos === null && !failed && (
        <p role="status" className="repos-loading">
          {messages.projects.loading}
        </p>
      )}

      {failed && (
        <p role="alert">{messages.projects.loadError}</p>
      )}

      {repos?.length === 0 && (
        <p className="app-empty">{messages.projects.empty}</p>
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

function AppContent() {
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

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
