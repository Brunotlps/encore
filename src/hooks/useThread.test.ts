// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useThread } from "./useThread";

beforeEach(() => {
  sessionStorage.clear();
});

describe("useThread", () => {
  it("começa sem thread para um repo novo", () => {
    const { result } = renderHook(() => useThread("overture"));
    expect(result.current.threadId).toBeUndefined();
  });

  it("guarda o thread_id recebido do backend", () => {
    const { result } = renderHook(() => useThread("overture"));
    act(() => result.current.saveThread("t-1"));
    expect(result.current.threadId).toBe("t-1");
  });

  it("persiste entre remontagens (sessionStorage)", () => {
    const first = renderHook(() => useThread("overture"));
    act(() => first.result.current.saveThread("t-1"));
    first.unmount();

    const second = renderHook(() => useThread("overture"));
    expect(second.result.current.threadId).toBe("t-1");
  });

  it("isola threads por repo — trocar de repo troca a conversa", () => {
    const { result, rerender } = renderHook(({ repo }) => useThread(repo), {
      initialProps: { repo: "overture" },
    });
    act(() => result.current.saveThread("t-overture"));

    rerender({ repo: "outro" });
    expect(result.current.threadId).toBeUndefined();

    act(() => result.current.saveThread("t-outro"));
    rerender({ repo: "overture" });
    expect(result.current.threadId).toBe("t-overture");
  });

  it("resetThread limpa só o thread daquele repo", () => {
    const { result, rerender } = renderHook(({ repo }) => useThread(repo), {
      initialProps: { repo: "overture" },
    });
    act(() => result.current.saveThread("t-overture"));
    rerender({ repo: "outro" });
    act(() => result.current.saveThread("t-outro"));

    act(() => result.current.resetThread());
    expect(result.current.threadId).toBeUndefined();

    rerender({ repo: "overture" });
    expect(result.current.threadId).toBe("t-overture");
  });
});
