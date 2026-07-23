import type { TrajectoryStep } from "../api";
import { useI18n } from "../i18n/I18nProvider";

function SearchIcon() {
  return (
    <svg
      className="trajectory-tool-icon trajectory-tool-icon--search"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <circle cx="10.8" cy="10.8" r="5.8" />
      <path d="m15.2 15.2 4 4" />
      <path className="trajectory-icon-detail" d="M8.3 10.8h5M10.8 8.3v5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      className="trajectory-tool-icon trajectory-tool-icon--file"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <path d="M7 3.75h6.2L18 8.6v11.65H7z" />
      <path d="M13 3.75V9h5M9.7 13h5.6M9.7 16h4" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg
      className="trajectory-tool-icon trajectory-tool-icon--terminal"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <rect x="3.75" y="5" width="16.5" height="14" rx="2.5" />
      <path d="m7.5 9 2.7 2.5L7.5 14M12.5 14h4" />
    </svg>
  );
}

function ToolIcon({ tool }: { tool: string }) {
  if (tool === "grep_repo") return <SearchIcon />;
  if (tool === "read_file") return <FileIcon />;
  return <TerminalIcon />;
}

function RouteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 6h3.5a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="m5 6 3 3 3-3" />
    </svg>
  );
}

// Como o agente chegou na resposta — o diferencial de portfólio (docs/decisions.md).
export function Trajectory({
  steps,
  iterations,
}: {
  steps: TrajectoryStep[];
  iterations: number;
}) {
  const { messages } = useI18n();
  if (steps.length === 0) return null;
  const stepCount = messages.trajectory.steps(steps.length);
  const iterationCount = messages.trajectory.iterations(iterations);

  return (
    <details className="trajectory">
      <summary>
        <span className="trajectory-overview-icon">
          <RouteIcon />
        </span>
        <span className="trajectory-overview">
          <strong>{messages.trajectory.title}</strong>
          <span aria-label={`${stepCount} · ${iterationCount}`}>
            {stepCount}
            <i aria-hidden="true" />
            {iterationCount}
          </span>
        </span>
        <span className="trajectory-chevron">
          <ChevronIcon />
        </span>
      </summary>

      <ol className="trajectory-steps">
        {steps.map((step, index) => (
          <li key={`${step.tool}-${index}`}>
            <span className="trajectory-node">
              <ToolIcon tool={step.tool} />
            </span>
            <div className="trajectory-step">
              <header>
                <strong>{step.tool}</strong>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </header>
              <code>{step.tool_input}</code>
              <p>{step.output_summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </details>
  );
}
