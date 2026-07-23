// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, ask, type AskResponse } from "../api";
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
  sessionStorage.clear();
});

describe("Chat", () => {
  it("mostra a pergunta do usuário e a resposta do agente", async () => {
    askMock.mockResolvedValueOnce(askResponse());
    render(<Chat repoId="overture" />);

    await sendQuestion("Como funciona o rate limit?");

    expect(screen.getByText("Como funciona o rate limit?")).toBeVisible();
    expect(await screen.findByText("O rate limit usa KV.")).toBeVisible();
    expect(screen.getByText("🔍 grep_repo · 2 iterações")).toBeInTheDocument();
  });

  it("mostra indicador de carregamento enquanto espera e limpa depois", async () => {
    let resolve!: (r: AskResponse) => void;
    askMock.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    render(<Chat repoId="overture" />);

    await sendQuestion("Como funciona o rate limit?");
    expect(screen.getByRole("status")).toBeVisible();

    resolve(askResponse());
    await waitFor(() =>
      expect(screen.queryByRole("status")).not.toBeInTheDocument(),
    );
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
    });
    expect(askMock).toHaveBeenNthCalledWith(2, {
      question: "Segunda?",
      repoId: "overture",
      threadId: "t-42",
    });
  });

  it("erro da API vira mensagem amigável e permite tentar de novo", async () => {
    askMock.mockRejectedValueOnce(new ApiError(429, "volte amanhã"));
    askMock.mockResolvedValueOnce(askResponse());
    render(<Chat repoId="overture" />);

    await sendQuestion("Primeira?");
    expect(await screen.findByRole("alert")).toHaveTextContent("volte amanhã");

    await sendQuestion("Segunda?");
    expect(await screen.findByText("O rate limit usa KV.")).toBeVisible();
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
});
