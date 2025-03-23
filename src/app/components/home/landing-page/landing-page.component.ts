import { Component } from "@angular/core";

import { LOGO_URL_BLACK, LOGO_URL_WHITE, TINY_SCREEN_SIZE_PX } from "@/app.constants";
import { TranslationService } from "@/services/translation/translation.service";

@Component({
  selector: "app-landing-page",
  templateUrl: "./landing-page.component.html",
  styleUrls: ["./landing-page.component.scss"],
  standalone: false,
})
export class HeaderComponent {
  constructor(protected translationService: TranslationService) {}

  get logoUrl() {
    try {
      return window.innerWidth <= TINY_SCREEN_SIZE_PX ? LOGO_URL_WHITE : LOGO_URL_BLACK;
    } catch {
      return LOGO_URL_BLACK;
    }
  }
}
