import type { LanguageCode, Translation } from "src/app/services/translation/translation.service";
import { Component } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import {
  LANGUAGE_CODE_MAPPINGS,
  TRANSLATIONS,
  TranslationService,
} from "src/app/services/translation/translation.service";

const TRANSLATION_ENTRIES = Object.entries(TRANSLATIONS) as [LanguageCode, Translation][];

@Component({
  imports: [MatIcon],
  selector: "app-language-select",
  templateUrl: "./language-select.component.html",
  styleUrls: ["./language-select.component.scss"],
})
export class LanguageSelectComponent {
  isLanguageSelectorOpen = false;
  languageCodes = TRANSLATION_ENTRIES.map(([code, data]) => [code, data.language] as const);

  constructor(protected translationService: TranslationService) {}

  getIcon = (languageCode: LanguageCode) => `fi fi-${LANGUAGE_CODE_MAPPINGS[languageCode] ?? languageCode}`;
}
