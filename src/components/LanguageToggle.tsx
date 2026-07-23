import { useI18n } from "../i18n/I18nProvider";
import type { Language } from "../i18n/types";

const OPTIONS: Array<{ language: Language; shortLabel: string }> = [
  { language: "pt-BR", shortLabel: "PT" },
  { language: "en", shortLabel: "EN" },
];

export function LanguageToggle() {
  const { language, setLanguage, messages } = useI18n();
  const labels: Record<Language, string> = {
    "pt-BR": messages.language.portugueseLabel,
    en: messages.language.englishLabel,
  };

  return (
    <div
      className="language-toggle"
      role="group"
      aria-label={messages.language.selectorLabel}
    >
      {OPTIONS.map((option) => (
        <button
          key={option.language}
          type="button"
          aria-label={labels[option.language]}
          aria-pressed={language === option.language}
          onClick={() => setLanguage(option.language)}
        >
          {option.shortLabel}
        </button>
      ))}
    </div>
  );
}
