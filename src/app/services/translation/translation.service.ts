import type { KeyValue } from "@angular/common";
import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

import { TRANSLATIONS_DK } from "./translations.dk";
import { TRANSLATIONS_DE } from "./translations.de";
import { TRANSLATIONS_EN } from "./translations.en";
import { TRANSLATIONS_NL } from "./translations.nl";
import { TRANSLATIONS_PL } from "./translations.pl";

export const TRANSLATIONS = {
  dk: TRANSLATIONS_DK,
  de: TRANSLATIONS_DE,
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
  private isBrowser: boolean;

  constructor(
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.selectedLanguage = this.savedLanguageCode ?? DEFAULT_LANGUAGE;
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get translations() {
    return { ...TRANSLATIONS[this.selectedLanguage], code: this.selectedLanguage };
  }

  get savedLanguageCode() {
    const languageCookie = this.cookieService.get("language");
    let language = this.isValidLanguageCode(languageCookie) ? languageCookie : null;
    if (language != null || !this.isBrowser) {
      return language;
    }
    const browserLanguage = navigator.language.split("-")[0].toLowerCase();
    if (this.isValidLanguageCode(browserLanguage)) {
      language = browserLanguage;
    } else {
      language = DEFAULT_LANGUAGE;
    }
    this.setSelectedLanguage(language);
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
    this.cookieService.set("language", language, { path: "/", expires: 365 });
    this.selectedLanguage = language;
  }

  /** Sort by object value */
  valueOrder = (a: KeyValue<string, string>, b: KeyValue<string, string>): number =>
    a.value.localeCompare(b.value, new Intl.Locale(this.selectedLanguage));
}
