export interface ProjectDetails {
  summary: string;
  stack: string[];
  suggestedQuestion: string;
}

export function getProjectDetails(
  details: Record<string, ProjectDetails>,
  repoId: string,
): ProjectDetails | undefined {
  return details[repoId];
}
