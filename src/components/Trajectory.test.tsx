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

  it("resume a investigação sem emojis e usa ícones vetoriais por ferramenta", () => {
    const { container } = render(<Trajectory steps={steps} iterations={3} />);
    const title = screen.getByText("Caminho da investigação");
    const summary = title.closest("summary");

    expect(summary).toHaveTextContent("2 etapas");
    expect(summary).toHaveTextContent("3 iterações");
    expect(summary).not.toHaveTextContent(/[🔍📄🔧]/u);
    expect(
      container.querySelector(".trajectory-tool-icon--search"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".trajectory-tool-icon--file"),
    ).toBeInTheDocument();
  });

  it("expande para mostrar input e resumo de saída de cada passo", async () => {
    render(<Trajectory steps={steps} iterations={3} />);
    const summary = screen
      .getByText("Caminho da investigação")
      .closest("summary")!;
    await userEvent.click(summary);

    expect(summary.parentElement).toHaveAttribute("open");
    expect(screen.getByText("rate limit")).toBeVisible();
    expect(screen.getByText("3 matches")).toBeVisible();
    expect(screen.getByText("src/api.ts")).toBeVisible();
    expect(screen.getByText("arquivo lido")).toBeVisible();
  });
});
