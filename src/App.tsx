import { useEffect, useState } from "react";
import { fetchRepos, type Repo } from "./api";
import { Chat } from "./components/Chat";
import { RepoSelector } from "./components/RepoSelector";

export default function App() {
  const [repos, setRepos] = useState<Repo[]>([]);
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

  return (
    <main className="app">
      <header>
        <h1>encore</h1>
        <p>Converse com um agente sobre o código dos meus projetos.</p>
      </header>

      {failed && (
        <p role="alert">Não consegui carregar a lista de projetos — recarregue a página.</p>
      )}

      {selected && (
        <>
          <RepoSelector repos={repos} selected={selected} onSelect={setSelected} />
          <Chat repoId={selected} />
        </>
      )}
    </main>
  );
}
