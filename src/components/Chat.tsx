import { lazy, Suspense, useState, type FormEvent } from "react";
import { ApiError, ask, type TrajectoryStep } from "../api";
import { useThread } from "../hooks/useThread";
import { Trajectory } from "./Trajectory";

const AgentMarkdown = lazy(() => import("./AgentMarkdown"));

type Message =
  | { role: "user"; text: string }
  | { role: "agent"; text: string; trajectory: TrajectoryStep[]; iterations: number };

export function Chat({ repoId }: { repoId: string }) {
  const { threadId, saveThread } = useThread(repoId);
  // Histórico por repo: trocar de projeto não apaga a conversa do anterior.
  const [messagesByRepo, setMessagesByRepo] = useState<Record<string, Message[]>>({});
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages = messagesByRepo[repoId] ?? [];
  const canSend = question.trim().length >= 3 && !loading;

  function append(repo: string, message: Message) {
    setMessagesByRepo((prev) => ({
      ...prev,
      [repo]: [...(prev[repo] ?? []), message],
    }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    const text = question.trim();

    setQuestion("");
    setError(null);
    append(repoId, { role: "user", text });
    setLoading(true);
    try {
      const res = await ask({ question: text, repoId, threadId });
      saveThread(res.thread_id);
      append(repoId, {
        role: "agent",
        text: res.answer,
        trajectory: res.trajectory,
        iterations: res.iterations,
      });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.detail : "Erro inesperado — tente de novo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="chat"
      aria-label={`Conversa sobre ${repoId}`}
      aria-busy={loading}
    >
      <ol className="chat-messages" aria-live="polite">
        {messages.map((message, i) => (
          <li key={i} className={`chat-message chat-message--${message.role}`}>
            {message.role === "user" ? (
              <p>{message.text}</p>
            ) : (
              <>
                <Suspense
                  fallback={<p className="agent-answer-loading">Formatando resposta…</p>}
                >
                  <AgentMarkdown>{message.text}</AgentMarkdown>
                </Suspense>
                <Trajectory
                  steps={message.trajectory}
                  iterations={message.iterations}
                />
              </>
            )}
          </li>
        ))}
      </ol>

      {loading && (
        <p role="status" className="chat-loading">
          O agente está investigando o código…
        </p>
      )}
      {error && (
        <p role="alert" className="chat-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="chat-form">
        <textarea
          aria-label="Pergunta sobre o projeto"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Pergunte algo sobre o código deste projeto…"
          maxLength={500}
          rows={2}
        />
        <button type="submit" disabled={!canSend}>
          Enviar
        </button>
      </form>
    </section>
  );
}
