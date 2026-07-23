// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ask, type AskResponse } from "../api";
import { I18nProvider } from "../i18n/I18nProvider";
import { Chat } from "./Chat";

vi.mock("../api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api")>()),
  ask: vi.fn(),
}));

const askMock = vi.mocked(ask);

function askResponse(overrides: Partial<AskResponse> = {}): AskResponse {
  return {
    answer: "O rate limit usa KV.",
    trajectory: [
      { tool: "grep_repo", tool_input: "rate", output_summary: "2 matches" },
    ],
    iterations: 2,
    thread_id: "t-1",
    ...overrides,
  };
}

async function sendQuestion(text: string) {
  await userEvent.type(screen.getByRole("textbox"), text);
  await userEvent.click(screen.getByRole("button", { name: /enviar/i }));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

describe("Chat", () => {
  it("mostra a pergunta do usuário e a resposta do agente", async () => {
    askMock.mockResolvedValueOnce(askResponse());
    render(<Chat repoId="overture" />);

    await sendQuestion("Como funciona o rate limit?");

    expect(screen.getByText("Como funciona o rate limit?")).toBeVisible();
    expect(await screen.findByText("O rate limit usa KV.")).toBeVisible();
    const trajectoryTitle = screen.getByText("Caminho da investigação");
    const summary = trajectoryTitle.closest("summary");
    expect(summary).toHaveTextContent("1 etapa");
    expect(summary).toHaveTextContent("2 iterações");
    expect(summary).not.toHaveTextContent(/[🔍📄🔧]/u);
    expect(
      trajectoryTitle.closest("details")?.querySelector(
        ".trajectory-tool-icon--search",
      ),
    ).toBeInTheDocument();
  });

  it("renderiza markdown do agente com semântica e código legível", async () => {
    askMock.mockResolvedValueOnce(
      askResponse({
        answer: [
          "## Arquitetura",
          "",
          "- API",
          "- Worker",
          "",
          "```ts",
          "const safe = true;",
          "```",
        ].join("\n"),
      }),
    );
    render(<Chat repoId="overture" />);

    await sendQuestion("Explique a arquitetura");

    const heading = await screen.findByRole("heading", {
      name: "Arquitetura",
      level: 2,
    });
    expect(heading).toBeVisible();
    expect(within(heading.parentElement!).getByRole("list")).toHaveTextContent(
      /API\s+Worker/,
    );
    expect(screen.getByText("const safe = true;")).toBeVisible();
  });

  it("ignora HTML cru do agente e mantém a pergunta como texto puro", async () => {
    askMock.mockResolvedValueOnce(
      askResponse({
        answer: 'Resposta <img src="x" alt="injetada" onerror="alert(1)"> segura.',
      }),
    );
    const { container } = render(<Chat repoId="overture" />);

    await sendQuestion("**pergunta literal**");

    expect(await screen.findByText("**pergunta literal**")).toBeVisible();
    expect(container.querySelector(".chat-message--user strong")).toBeNull();
    expect(screen.queryByRole("img", { name: "injetada" })).not.toBeInTheDocument();
  });

  it("mostra indicador de carregamento enquanto espera e limpa depois", async () => {
    let resolve!: (r: AskResponse) => void;
    askMock.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    render(<Chat repoId="overture" />);

    await sendQuestion("Como funciona o rate limit?");
    const status = screen.getByRole("status");
    expect(status).toBeVisible();
    expect(status).toHaveAccessibleName(
      "O agente está investigando o código…",
    );
    expect(status).toHaveTextContent(/^$/);
    expect(status.querySelectorAll(".agent-loader__node")).toHaveLength(3);
    expect(
      screen.getByRole("region", { name: "Conversa sobre overture" }),
    ).toHaveAttribute("aria-busy", "true");

    resolve(askResponse());
    await waitFor(() =>
      expect(screen.queryByRole("status")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("region", { name: "Conversa sobre overture" }),
    ).toHaveAttribute("aria-busy", "false");
  });

  it("primeira pergunta vai sem thread_id; a seguinte reusa o recebido", async () => {
    askMock.mockResolvedValue(askResponse({ thread_id: "t-42" }));
    render(<Chat repoId="overture" />);

    await sendQuestion("Primeira?");
    await screen.findByText("O rate limit usa KV.");
    await sendQuestion("Segunda?");

    expect(askMock).toHaveBeenNthCalledWith(1, {
      question: "Primeira?",
      repoId: "overture",
      threadId: undefined,
      language: "pt-BR",
    });
    expect(askMock).toHaveBeenNthCalledWith(2, {
      question: "Segunda?",
      repoId: "overture",
      threadId: "t-42",
      language: "pt-BR",
    });
  });

  it("erro da API vira mensagem amigável e permite tentar de novo", async () => {
    askMock.mockRejectedValueOnce(new ApiError(429, "volte amanhã"));
    askMock.mockResolvedValueOnce(askResponse());
    render(<Chat repoId="overture" />);

    await sendQuestion("Primeira?");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /limite de perguntas/i,
    );

    await sendQuestion("Segunda?");
    expect(await screen.findByText("O rate limit usa KV.")).toBeVisible();
  });

  it.each([
    [404, /projeto não está disponível/i],
    [422, /revise a pergunta/i],
    [500, /não foi possível obter uma resposta/i],
  ])("localiza o erro HTTP %s sem exibir o detail da API", async (status, copy) => {
    askMock.mockRejectedValueOnce(new ApiError(status, "English API detail"));
    render(<Chat repoId="overture" />);

    await sendQuestion("Pergunta válida?");

    expect(await screen.findByRole("alert")).toHaveTextContent(copy);
    expect(screen.getByRole("alert")).not.toHaveTextContent("English API detail");
  });

  it("localiza erros no idioma inglês selecionado", async () => {
    localStorage.setItem("encore:language", "en");
    askMock.mockRejectedValueOnce(new ApiError(404, "Unknown repo_id"));
    render(
      <I18nProvider>
        <Chat repoId="overture" />
      </I18nProvider>,
    );

    await userEvent.type(screen.getByRole("textbox"), "A valid question?");
    await userEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This project is not available right now.",
    );
  });

  it("não envia pergunta com menos de 3 caracteres", async () => {
    render(<Chat repoId="overture" />);

    await userEvent.type(screen.getByRole("textbox"), "oi");
    expect(screen.getByRole("button", { name: /enviar/i })).toBeDisabled();
    expect(askMock).not.toHaveBeenCalled();
  });

  it("limpa o input após enviar", async () => {
    askMock.mockResolvedValueOnce(askResponse());
    render(<Chat repoId="overture" />);

    await sendQuestion("Como funciona o rate limit?");
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("envia a pergunta ao pressionar Enter", async () => {
    askMock.mockResolvedValueOnce(askResponse());
    const user = userEvent.setup();
    render(<Chat repoId="overture" />);

    await user.type(screen.getByRole("textbox"), "Como funciona o agente?");
    await user.keyboard("{Enter}");

    expect(askMock).toHaveBeenCalledWith({
      question: "Como funciona o agente?",
      repoId: "overture",
      threadId: undefined,
      language: "pt-BR",
    });
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("mantém quebra de linha com Shift+Enter", async () => {
    const user = userEvent.setup();
    render(<Chat repoId="overture" />);

    await user.type(screen.getByRole("textbox"), "Primeira linha");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(screen.getByRole("textbox"), "Segunda linha");

    expect(screen.getByRole("textbox")).toHaveValue(
      "Primeira linha\nSegunda linha",
    );
    expect(askMock).not.toHaveBeenCalled();
  });
});
