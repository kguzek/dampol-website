import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

import { TRANSLATIONS_DK } from "./translations.dk";
import { TRANSLATIONS_EN } from "./translations.en";
import { TRANSLATIONS_NL } from "./translations.nl";
import { TRANSLATIONS_PL } from "./translations.pl";

export const TRANSLATIONS = {
  dk: TRANSLATIONS_DK,
  nl: TRANSLATIONS_NL,
  en: TRANSLATIONS_EN,
  pl: TRANSLATIONS_PL,
};

export type LanguageCode = keyof typeof TRANSLATIONS;
export type Translation = (typeof TRANSLATIONS)[LanguageCode];

export const LANGUAGE_CODE_MAPPINGS: { [code in LanguageCode]?: string } = {
  en: "gb",
};
const mapCode = (code: string) => LANGUAGE_CODE_MAPPINGS[code as LanguageCode] ?? code;

export const DEFAULT_LANGUAGE = "en";

@Injectable({
  providedIn: "root",
})
export class TranslationService {
  private selectedLanguage!: LanguageCode;

  constructor(private cookieService: CookieService) {
    this.selectedLanguage = this.savedLanguageCode ?? DEFAULT_LANGUAGE;
  }

  get translations() {
    return { ...TRANSLATIONS[this.selectedLanguage], code: this.selectedLanguage };
  }

  get savedLanguageCode() {
    const languageCookie = this.cookieService.get("language");
    const language = this.isValidLanguageCode(languageCookie) ? languageCookie : null;
    return language;
  }

  get countryCodes() {
    const sorted = Object.keys(TRANSLATIONS).sort((a, b) =>
      a === this.selectedLanguage ? -1 : b === this.selectedLanguage ? 1 : 0,
    );
    return sorted.map((key) => mapCode(key).toUpperCase());
  }

  isValidLanguageCode = (code: string): code is LanguageCode => code in TRANSLATIONS;

  setSelectedLanguage(language: LanguageCode) {
    this.cookieService.set("language", language);
    this.selectedLanguage = language;
  }

  /** Formats the given numeric value as a price according to the selected locale. */
  formatPrice(value: number) {
    if (isNaN(value)) return "";
    return this.translations.ui.price.format.format(value * this.translations.ui.price.multiplier);
  }
}
