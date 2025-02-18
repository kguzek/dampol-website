import { Component } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import {
  TRANSLATIONS,
  TranslationService,
  type LanguageCode,
  type Translation,
} from "src/app/services/translation/translation.service";

const TRANSLATION_ENTRIES = Object.entries(TRANSLATIONS) as [LanguageCode, Translation][];

const CODE_ICONS: { [code in LanguageCode]: string } = {
  dk: "dk",
  en: "gb",
};

@Component({
  imports: [MatIcon],
  selector: "app-language-select",
  templateUrl: "./language-select.component.html",
  styleUrls: ["./language-select.component.scss"],
})
export class LanguageSelectComponent {
  isLanguageSelectorOpen = false;
  languageCodes = TRANSLATION_ENTRIES.map(([code, data]) => [code, data.languageCode] as const);

  constructor(protected translationService: TranslationService) {}

  getIcon(code: LanguageCode): string {
    return `fi fi-${CODE_ICONS[code]}`;
  }
}
