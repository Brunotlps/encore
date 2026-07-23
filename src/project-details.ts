export interface ProjectDetails {
  summary: string;
  stack: string[];
  suggestedQuestion: string;
}

const REPOSITORY_URLS: Record<string, string> = {
  overture: "https://github.com/Brunotlps/overture",
  codda: "https://github.com/Brunotlps/codda",
  briskmail: "https://github.com/Brunotlps/email-classifier",
  interlude: "https://github.com/Brunotlps/interlude",
  encore: "https://github.com/Brunotlps/encore",
};

export function getProjectDetails(
  details: Record<string, ProjectDetails>,
  repoId: string,
): ProjectDetails | undefined {
  return details[repoId];
}

export function getRepositoryUrl(repoId: string): string | undefined {
  return REPOSITORY_URLS[repoId];
}
