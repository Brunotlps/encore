import type { Repo } from "../api";
import { useI18n } from "../i18n/I18nProvider";

export function RepoSelector({
  repos,
  selected,
  onSelect,
}: {
  repos: Repo[];
  selected: string;
  onSelect: (repoId: string) => void;
}) {
  const { messages } = useI18n();

  return (
    <nav className="repo-selector" aria-label={messages.projects.selectorAria}>
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
