import type { Repo } from "../api";
import { useI18n } from "../i18n/I18nProvider";
import { getProjectDetails } from "../project-details";

export function ProjectDescription({ repo }: { repo: Repo }) {
  const { messages } = useI18n();
  const details = getProjectDetails(messages.projectDetails, repo.repo_id);
  if (!details) return null;

  return (
    <aside
      className="project-description"
      aria-label={messages.projects.aboutRepo(repo.display_name)}
    >
      <p>{details.summary}</p>
      <ul aria-label={messages.projects.stackAria}>
        {details.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="project-question">
        <span>{messages.projects.suggestedQuestion}</span>
        {details.suggestedQuestion}
      </p>
    </aside>
  );
}
