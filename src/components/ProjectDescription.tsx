import type { Repo } from "../api";
import { useI18n } from "../i18n/I18nProvider";
import { getProjectDetails, getRepositoryUrl } from "../project-details";

export function ProjectDescription({ repo }: { repo: Repo }) {
  const { messages } = useI18n();
  const details = getProjectDetails(messages.projectDetails, repo.repo_id);
  const repositoryUrl = getRepositoryUrl(repo.repo_id);
  if (!details) return null;

  return (
    <aside
      className="project-description"
      aria-label={messages.projects.aboutRepo(repo.display_name)}
    >
      <div className="project-description__top">
        <p>{details.summary}</p>
        {repositoryUrl && (
          <a
            className="repository-link"
            href={repositoryUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={messages.projects.repositoryLinkAria(repo.display_name)}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 2.5a9.75 9.75 0 0 0-3.08 19c.49.09.67-.21.67-.47v-1.7c-2.72.59-3.3-1.16-3.3-1.16-.44-1.13-1.09-1.43-1.09-1.43-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.88 1.5 2.3 1.07 2.86.82.09-.63.34-1.07.62-1.32-2.17-.25-4.46-1.09-4.46-4.82 0-1.07.38-1.94 1.01-2.62-.1-.25-.44-1.24.1-2.59 0 0 .82-.26 2.68 1a9.3 9.3 0 0 1 4.88 0c1.86-1.26 2.68-1 2.68-1 .54 1.35.2 2.34.1 2.59.63.68 1.01 1.55 1.01 2.62 0 3.74-2.29 4.57-4.47 4.81.35.31.66.91.66 1.84v2.73c0 .26.18.57.67.47A9.75 9.75 0 0 0 12 2.5Z" />
            </svg>
            <span>{messages.projects.repositoryLink}</span>
            <svg
              className="repository-link__arrow"
              aria-hidden="true"
              viewBox="0 0 16 16"
            >
              <path d="M5 11 11 5M6 5h5v5" />
            </svg>
          </a>
        )}
      </div>
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
