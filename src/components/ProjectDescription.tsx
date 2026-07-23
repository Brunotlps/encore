import type { Repo } from "../api";
import { getProjectDetails } from "../project-details";

export function ProjectDescription({ repo }: { repo: Repo }) {
  const details = getProjectDetails(repo.repo_id);
  if (!details) return null;

  return (
    <aside className="project-description" aria-label={`Sobre ${repo.display_name}`}>
      <p>{details.summary}</p>
      <ul aria-label="Stack e tecnologias">
        {details.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="project-question">
        <span>Experimente perguntar</span>
        {details.suggestedQuestion}
      </p>
    </aside>
  );
}
