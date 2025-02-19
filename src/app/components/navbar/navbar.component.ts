import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { originalOrder } from "@/app.component";
import { SMALL_SCREEN_SIZE_PX, TINY_SCREEN_SIZE_PX } from "@/app.constants";
import { TranslationService } from "@/services/translation/translation.service";

@Component({
  selector: "app-navbar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  standalone: false,
})
export class NavbarComponent {
  constructor(protected translationService: TranslationService) {}

  @Input({ required: true }) showDarkHamburger!: boolean;

  isMenuOpen = false;

  originalOrder = originalOrder;

  shouldShowProductsLink() {
    try {
      return window.innerWidth <= TINY_SCREEN_SIZE_PX || window.innerWidth > SMALL_SCREEN_SIZE_PX;
    } catch {
      return true;
    }
  }
}
