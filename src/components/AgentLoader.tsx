export function AgentLoader({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`agent-loader${compact ? " agent-loader--compact" : ""}`}
      role="status"
      aria-label={label}
    >
      <span className="agent-loader__track" aria-hidden="true">
        <span className="agent-loader__beam" />
        <span className="agent-loader__node" />
        <span className="agent-loader__node" />
        <span className="agent-loader__node" />
      </span>
    </div>
  );
}
