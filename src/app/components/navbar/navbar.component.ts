import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { originalOrder } from 'src/app/app.component';
import {
  SMALL_SCREEN_SIZE_PX,
  TINY_SCREEN_SIZE_PX,
} from 'src/app/app.constants';
import { TranslationService } from 'src/app/translation.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: false,
})
export class NavbarComponent {
  constructor(protected translationService: TranslationService) {}

  @Input() showDarkHamburger!: boolean;

  isMenuOpen = false;

  originalOrder = originalOrder;

  shouldShowProductsLink() {
    try {
      return (
        window.innerWidth <= TINY_SCREEN_SIZE_PX ||
        window.innerWidth > SMALL_SCREEN_SIZE_PX
      );
    } catch {
      return true;
    }
  }
}
