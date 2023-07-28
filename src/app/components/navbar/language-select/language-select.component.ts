import { Component } from '@angular/core';
import { TRANSLATIONS, TranslationService } from 'src/app/translation.service';

@Component({
  selector: 'app-language-select',
  templateUrl: './language-select.component.html',
  styleUrls: ['./language-select.component.scss'],
})
export class LanguageSelectComponent {
  constructor(protected translationService: TranslationService) {}

  isLanguageSelectorOpen = false;

  // Creates an object with key-value pairs such as { gb: "EN (UK)" }
  languageCodes = Object.fromEntries(
    Object.entries(TRANSLATIONS).map(([lang, translations]) => [
      lang,
      translations.languageCode,
    ])
  );
}
