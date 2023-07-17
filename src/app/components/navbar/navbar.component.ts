import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { originalOrder } from 'src/app/app.component';
import {
  LanguageCode,
  TRANSLATIONS,
  Translation,
} from 'src/app/app.translations';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() setSelectedLanguage!: (language: string) => void;
  @Input() selectedLanguage!: LanguageCode;
  @Input() translations!: Translation;

  isMenuOpen = false;
  isLanguageSelectorOpen = false;

  originalOrder = originalOrder;

  // Creates an object with key-value pairs such as { gb: "EN (UK)" }
  languageCodes = Object.fromEntries(
    Object.entries(TRANSLATIONS).map(([lang, translations]) => [
      lang,
      translations.languageCode,
    ])
  );

  scrollToSection(sectionId: string) {
    this.isMenuOpen = false;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
}
