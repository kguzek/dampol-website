import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { originalOrder } from "@/app.component";
import { LOGO_URL_WHITE } from "@/app.constants";
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
  logoUrl = LOGO_URL_WHITE;

  originalOrder = originalOrder;
}
