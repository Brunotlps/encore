import type { ProjectDetails } from "../project-details";

export type Language = "pt-BR" | "en";

export interface Messages {
  metaDescription: string;
  language: {
    selectorLabel: string;
    portugueseLabel: string;
    englishLabel: string;
  };
  header: {
    homeAria: string;
    navigationAria: string;
    about: string;
    projects: string;
  };
  about: {
    role: string;
    title: string;
    bio: string;
    professionalLinksAria: string;
    encore: {
      eyebrow: string;
      title: string;
      intro: string;
      highlight: string;
      stepsAria: string;
      steps: Array<{
        title: string;
        description: string;
      }>;
      architectureAria: string;
      interfaceLabel: string;
      interfaceDescription: string;
      agentLabel: string;
      agentDescription: string;
      tryEyebrow: string;
      tryDescription: string;
      cta: string;
    };
  };
  projects: {
    eyebrow: string;
    title: string;
    subtitle: string;
    loading: string;
    loadError: string;
    empty: string;
    selectorAria: string;
    aboutRepo: (displayName: string) => string;
    stackAria: string;
    suggestedQuestion: string;
  };
  chat: {
    regionAria: (repoId: string) => string;
    formatting: string;
    loading: string;
    questionAria: string;
    placeholder: string;
    shortcutTitle: string;
    send: string;
  };
  trajectory: {
    iterations: (count: number) => string;
  };
  errors: {
    unknownRepo: string;
    validation: string;
    rateLimit: string;
    generic: string;
  };
  projectDetails: Record<string, ProjectDetails>;
}
