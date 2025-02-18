import { inject, Injectable } from "@angular/core";
import { TRANSLATIONS_EN } from "./translations.en";
import { TRANSLATIONS_DK } from "./translations.dk";
import { CookieService } from "ngx-cookie-service";

export const TRANSLATIONS = {
  dk: TRANSLATIONS_DK,
  en: TRANSLATIONS_EN,
};

export type LanguageCode = keyof typeof TRANSLATIONS;
export type Translation = (typeof TRANSLATIONS)[LanguageCode];

const isValidLanguageCode = (code: string): code is LanguageCode => code in TRANSLATIONS;

export const DEFAULT_LANGUAGE = "en";

@Injectable({
  providedIn: "root",
  deps: [CookieService],
})
export class TranslationService {
  selectedLanguage: LanguageCode;

  constructor(private cookieService: CookieService) {
    const languageCookie = this.cookieService.get("language");
    const language = isValidLanguageCode(languageCookie) ? languageCookie : DEFAULT_LANGUAGE;
    this.setSelectedLanguage(language);
    this.selectedLanguage = language;
  }

  get translations() {
    return TRANSLATIONS[this.selectedLanguage];
  }

  setSelectedLanguage(language: LanguageCode) {
    this.cookieService.set("language", language);
    this.selectedLanguage = language;
    return language;
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
