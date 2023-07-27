import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { originalOrder } from 'src/app/app.component';
import { LanguageCode, Translation } from 'src/app/app.translations';

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
  @Input() onSecondPage!: boolean;

  isMenuOpen = false;

  originalOrder = originalOrder;

  scrollToSection(sectionId: string) {
    this.isMenuOpen = false;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
}
