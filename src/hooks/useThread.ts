import { useCallback, useSyncExternalStore } from "react";

// Mapa {repo_id: thread_id} em sessionStorage — conversa isolada por repo,
// zerada ao fechar a aba (regras 1 e 2 de docs/api-contract.md).
const STORAGE_KEY = "encore:threads";

type ThreadMap = Record<string, string>;

const listeners = new Set<() => void>();
let cache: { raw: string | null; map: ThreadMap } = { raw: null, map: {} };

function readMap(): ThreadMap {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw !== cache.raw) {
    cache = { raw, map: raw ? (JSON.parse(raw) as ThreadMap) : {} };
  }
  return cache.map;
}

function writeMap(update: (map: ThreadMap) => ThreadMap) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(update(readMap())));
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function useThread(repoId: string) {
  const threadId: string | undefined = useSyncExternalStore(
    subscribe,
    () => readMap()[repoId],
  );

  const saveThread = useCallback(
    (id: string) => writeMap((map) => ({ ...map, [repoId]: id })),
    [repoId],
  );

  const resetThread = useCallback(
    () => writeMap(({ [repoId]: _removed, ...rest }) => rest),
    [repoId],
  );

  return { threadId, saveThread, resetThread };
}
