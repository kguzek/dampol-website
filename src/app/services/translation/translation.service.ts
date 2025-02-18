import { Injectable } from "@angular/core";
import { TRANSLATIONS_GB } from "./translations.gb";
import { TRANSLATIONS_DK } from "./translations.dk";

export const TRANSLATIONS = {
  dk: TRANSLATIONS_DK,
  gb: TRANSLATIONS_GB,
};

export type LanguageCode = keyof typeof TRANSLATIONS;
export type Translation = (typeof TRANSLATIONS)[LanguageCode];

function tryGetLanguage() {
  try {
    return localStorage.getItem("language");
  } catch {
    return null;
  }
}

@Injectable()
export class TranslationService {
  selectedLanguage: LanguageCode = (tryGetLanguage() || "gb") as LanguageCode;

  get translations() {
    return TRANSLATIONS[this.selectedLanguage];
  }

  setSelectedLanguage(language: string) {
    this.selectedLanguage = language as LanguageCode;
    localStorage.setItem("language", language);
  }

  /** Formats the given numeric value as a price according to the selected locale. */
  formatPrice(value: number) {
    if (isNaN(value)) return "";
    const locale = this.translations.iso639Locale;
    const formatter = Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
    });
    return formatter.format(value);
  }
}
