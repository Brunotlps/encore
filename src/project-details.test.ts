import { describe, expect, it } from "vitest";
import { en } from "./i18n/en";
import { ptBR } from "./i18n/pt-BR";
import { getProjectDetails, getRepositoryUrl } from "./project-details";

describe("getProjectDetails", () => {
  it.each([
    ["pt-BR", ptBR.projectDetails],
    ["en", en.projectDetails],
  ])("tem conteúdo editorial completo em %s", (_locale, dictionary) => {
    for (const repoId of ["overture", "codda", "briskmail", "interlude", "encore"]) {
      const details = getProjectDetails(dictionary, repoId);
      expect(details?.summary).toBeTruthy();
      expect(details?.stack.length).toBeGreaterThan(0);
      expect(details?.suggestedQuestion).toBeTruthy();
    }
  });

  it("devolve undefined para repo_id desconhecido", () => {
    expect(
      getProjectDetails(ptBR.projectDetails, "ainda-nao-mapeado"),
    ).toBeUndefined();
  });

  it.each([
    ["overture", "https://github.com/Brunotlps/overture"],
    ["codda", "https://github.com/Brunotlps/codda"],
    ["briskmail", "https://github.com/Brunotlps/email-classifier"],
    ["interlude", "https://github.com/Brunotlps/interlude"],
    ["encore", "https://github.com/Brunotlps/encore"],
  ])("mapeia %s para o repositório público correto", (repoId, url) => {
    expect(getRepositoryUrl(repoId)).toBe(url);
  });
});
