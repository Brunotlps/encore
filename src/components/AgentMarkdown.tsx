import Markdown from "react-markdown";

export default function AgentMarkdown({ children }: { children: string }) {
  return (
    <div className="agent-answer">
      <Markdown skipHtml disallowedElements={["img"]} unwrapDisallowed>
        {children}
      </Markdown>
    </div>
  );
}
