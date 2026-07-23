// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { TrajectoryStep } from "../api";
import { Trajectory } from "./Trajectory";

const steps: TrajectoryStep[] = [
  { tool: "grep_repo", tool_input: "rate limit", output_summary: "3 matches" },
  { tool: "read_file", tool_input: "src/api.ts", output_summary: "arquivo lido" },
];

describe("Trajectory", () => {
  it("não renderiza nada sem passos", () => {
    const { container } = render(<Trajectory steps={[]} iterations={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra a cadeia de ferramentas na linha-resumo", () => {
    render(<Trajectory steps={steps} iterations={3} />);
    expect(
      screen.getByText("🔍 grep_repo → 📄 read_file · 3 iterações"),
    ).toBeVisible();
  });

  it("expande para mostrar input e resumo de saída de cada passo", async () => {
    render(<Trajectory steps={steps} iterations={3} />);
    await userEvent.click(
      screen.getByText("🔍 grep_repo → 📄 read_file · 3 iterações"),
    );

    expect(screen.getByText("rate limit")).toBeVisible();
    expect(screen.getByText("3 matches")).toBeVisible();
    expect(screen.getByText("src/api.ts")).toBeVisible();
    expect(screen.getByText("arquivo lido")).toBeVisible();
  });
});
