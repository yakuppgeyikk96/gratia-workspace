export interface Language {
  value: string;
  label: string;
  icon: string;
}

export const LANGUAGES: Language[] = [
  { value: "en", label: "English", icon: "🇺🇸" },
  { value: "tr", label: "Türkçe", icon: "🇹🇷" },
  { value: "de", label: "Deutsch", icon: "🇩🇪" },
  { value: "fr", label: "Français", icon: "🇫🇷" },
];
