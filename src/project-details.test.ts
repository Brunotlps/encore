import { describe, expect, it } from "vitest";
import { getProjectDetails } from "./project-details";

describe("getProjectDetails", () => {
  it.each(["overture", "codda", "briskmail", "interlude"])(
    "tem conteúdo editorial para o projeto em produção %s",
    (repoId) => {
      const details = getProjectDetails(repoId);
      expect(details?.summary).toBeTruthy();
      expect(details?.stack.length).toBeGreaterThan(0);
      expect(details?.suggestedQuestion).toBeTruthy();
    },
  );

  it("devolve undefined para repo_id desconhecido", () => {
    expect(getProjectDetails("ainda-nao-mapeado")).toBeUndefined();
  });
});
