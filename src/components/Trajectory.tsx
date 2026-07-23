import type { TrajectoryStep } from "../api";
import { useI18n } from "../i18n/I18nProvider";

const TOOL_ICONS: Record<string, string> = {
  grep_repo: "🔍",
  read_file: "📄",
};

function icon(tool: string) {
  return TOOL_ICONS[tool] ?? "🔧";
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

  const chain = steps.map((step) => `${icon(step.tool)} ${step.tool}`).join(" → ");
  const label = `${chain} · ${messages.trajectory.iterations(iterations)}`;

  return (
    <details className="trajectory">
      <summary>{label}</summary>
      <ol>
        {steps.map((step, i) => (
          <li key={i}>
            <strong>
              {icon(step.tool)} {step.tool}
            </strong>
            <code>{step.tool_input}</code>
            <p>{step.output_summary}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}
