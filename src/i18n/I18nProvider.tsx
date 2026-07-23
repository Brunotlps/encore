import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "./en";
import { ptBR } from "./pt-BR";
import type { Language, Messages } from "./types";

export const LANGUAGE_STORAGE_KEY = "encore:language";

const dictionaries: Record<Language, Messages> = {
  "pt-BR": ptBR,
  en,
};

interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  messages: Messages;
}

const fallbackValue: I18nValue = {
  language: "pt-BR",
  setLanguage: () => undefined,
  messages: ptBR,
};

const I18nContext = createContext<I18nValue>(fallbackValue);

function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "en" || stored === "pt-BR" ? stored : "pt-BR";
  } catch {
    return "pt-BR";
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);
  const messages = dictionaries[language];

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // A preferência continua válida nesta visita quando storage está indisponível.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (description) description.content = messages.metaDescription;
  }, [language, messages.metaDescription]);

  const value = useMemo(
    () => ({ language, setLanguage, messages }),
    [language, messages, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
