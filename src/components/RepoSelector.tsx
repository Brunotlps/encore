import type { Repo } from "../api";

export function RepoSelector({
  repos,
  selected,
  onSelect,
}: {
  repos: Repo[];
  selected: string;
  onSelect: (repoId: string) => void;
}) {
  return (
    <nav className="repo-selector" aria-label="Projetos">
      {repos.map((repo) => (
        <button
          key={repo.repo_id}
          type="button"
          aria-pressed={repo.repo_id === selected}
          onClick={() => onSelect(repo.repo_id)}
        >
          {repo.display_name}
        </button>
      ))}
    </nav>
  );
}
