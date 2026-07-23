// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
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
  fetchReposMock.mockReset();
  sessionStorage.clear();
  window.history.replaceState({}, "", "/chat");
});

describe("App", () => {
  it("apresenta Bruno e o propósito do Encore na página inicial", () => {
    window.history.replaceState({}, "", "/");
    render(<App />);

    expect(screen.getByText(/sou desenvolvedor backend/i)).toBeVisible();
    expect(screen.getByText(/portfólio interativo/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/Brunotlps",
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/brunotlps/",
    );
    expect(screen.getByRole("link", { name: /99freelas/i })).toHaveAttribute(
      "href",
      "https://www.99freelas.com.br/user/brunotlps",
    );
  });

  it("navega claramente entre About e chat", async () => {
    fetchReposMock.mockResolvedValueOnce(repos);
    window.history.replaceState({}, "", "/");
    render(<App />);

    const navigation = screen.getByRole("navigation", {
      name: "Navegação principal",
    });
    expect(within(navigation).getByRole("link", { name: "Sobre" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await userEvent.click(
      screen.getByRole("link", { name: /conversar sobre os projetos/i }),
    );
    expect(await screen.findByRole("button", { name: "Overture" })).toBeVisible();
    expect(window.location.pathname).toBe("/chat");
    expect(
      within(navigation).getByRole("link", { name: "Projetos" }),
    ).toHaveAttribute("aria-current", "page");

    await userEvent.click(screen.getByRole("link", { name: /sobre/i }));
    expect(screen.getByText(/sou desenvolvedor backend/i)).toBeVisible();
    expect(window.location.pathname).toBe("/");
  });

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

  it("informa enquanto carrega a lista de projetos", () => {
    fetchReposMock.mockReturnValueOnce(new Promise(() => undefined));
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent(/carregando projetos/i);
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

  it("mostra a descrição do projeto selecionado", async () => {
    fetchReposMock.mockResolvedValueOnce(repos);
    render(<App />);

    expect(
      await screen.findByRole("complementary", { name: "Sobre Overture" }),
    ).toHaveTextContent(/agente react/i);

    await userEvent.click(screen.getByRole("button", { name: "Encore" }));
    expect(
      screen.getByRole("complementary", { name: "Sobre Encore" }),
    ).toHaveTextContent(/react.*typescript.*vite/i);
  });

  it("mantém o chat funcional para um projeto ainda sem descrição", async () => {
    fetchReposMock.mockResolvedValueOnce([
      { repo_id: "novo", display_name: "Projeto novo" },
    ]);
    render(<App />);

    expect(
      await screen.findByRole("button", { name: "Projeto novo" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeVisible();
  });

  it("mostra estado vazio quando não há projetos cadastrados", async () => {
    fetchReposMock.mockResolvedValueOnce([]);
    render(<App />);

    expect(
      await screen.findByText(/nenhum projeto disponível/i),
    ).toBeVisible();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("mostra erro amigável quando a lista de projetos falha", async () => {
    fetchReposMock.mockRejectedValueOnce(new ApiError(500, "boom"));
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/projetos/i);
  });
});
