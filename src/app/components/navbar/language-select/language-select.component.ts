import { Component, Input } from '@angular/core';
import {
  LanguageCode,
  TRANSLATIONS,
  Translation,
} from 'src/app/app.translations';

@Component({
  selector: 'app-language-select',
  templateUrl: './language-select.component.html',
  styleUrls: ['./language-select.component.scss'],
})
export class LanguageSelectComponent {
  @Input() setSelectedLanguage!: (language: string) => void;
  @Input() selectedLanguage!: LanguageCode;
  @Input() translations!: Translation;

  isLanguageSelectorOpen = false;

  // Creates an object with key-value pairs such as { gb: "EN (UK)" }
  languageCodes = Object.fromEntries(
    Object.entries(TRANSLATIONS).map(([lang, translations]) => [
      lang,
      translations.languageCode,
    ])
  );
}
