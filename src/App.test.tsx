// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, fetchRepos } from "./api";
import App from "./App";

vi.mock("./api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api")>()),
  fetchRepos: vi.fn(),
  ask: vi.fn(),
}));

const fetchReposMock = vi.mocked(fetchRepos);

const repos = [
  { repo_id: "overture", display_name: "Overture" },
  { repo_id: "encore", display_name: "Encore" },
];

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe("App", () => {
  it("lista os projetos e pré-seleciona o primeiro", async () => {
    fetchReposMock.mockResolvedValueOnce(repos);
    render(<App />);

    const first = await screen.findByRole("button", { name: "Overture" });
    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Encore" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("textbox")).toBeVisible(); // chat pronto
  });

  it("trocar de projeto move a seleção", async () => {
    fetchReposMock.mockResolvedValueOnce(repos);
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "Encore" }));
    expect(screen.getByRole("button", { name: "Encore" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Overture" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("mostra erro amigável quando a lista de projetos falha", async () => {
    fetchReposMock.mockRejectedValueOnce(new ApiError(500, "boom"));
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/projetos/i);
  });
});
