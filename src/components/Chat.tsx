import {
  lazy,
  Suspense,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ApiError, ask, type TrajectoryStep } from "../api";
import { useThread } from "../hooks/useThread";
import { useI18n } from "../i18n/I18nProvider";
import { Trajectory } from "./Trajectory";

const AgentMarkdown = lazy(() => import("./AgentMarkdown"));

type Message =
  | { role: "user"; text: string }
  | { role: "agent"; text: string; trajectory: TrajectoryStep[]; iterations: number };

export function Chat({ repoId }: { repoId: string }) {
  const { language, messages: ui } = useI18n();
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

  function localizedError(error: unknown) {
    if (!(error instanceof ApiError)) return ui.errors.generic;

    switch (error.status) {
      case 404:
        return ui.errors.unknownRepo;
      case 422:
        return ui.errors.validation;
      case 429:
        return ui.errors.rateLimit;
      default:
        return ui.errors.generic;
    }
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
      const res = await ask({ question: text, repoId, threadId, language });
      saveThread(res.thread_id);
      append(repoId, {
        role: "agent",
        text: res.answer,
        trajectory: res.trajectory,
        iterations: res.iterations,
      });
    } catch (err) {
      setError(localizedError(err));
    } finally {
      setLoading(false);
    }
  }

  function handleQuestionKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <section
      className="chat"
      aria-label={ui.chat.regionAria(repoId)}
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
                  fallback={<p className="agent-answer-loading">{ui.chat.formatting}</p>}
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
          {ui.chat.loading}
        </p>
      )}
      {error && (
        <p role="alert" className="chat-error">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="chat-form">
        <textarea
          aria-label={ui.chat.questionAria}
          aria-keyshortcuts="Enter"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleQuestionKeyDown}
          placeholder={ui.chat.placeholder}
          title={ui.chat.shortcutTitle}
          maxLength={500}
          rows={2}
        />
        <button type="submit" disabled={!canSend}>
          {ui.chat.send}
        </button>
      </form>
    </section>
  );
}
