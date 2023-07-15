import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import {
  LANGUAGE_CODES,
  LanguageCode,
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
  languageCodes = LANGUAGE_CODES;
  links: (keyof Translation['navbar'])[] = ['about', 'contact', 'products'];

  closeMenu() {
    this.isMenuOpen = false;
  }
}
