import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

import { PlatformService } from "@/services/platform/platform.service";
import { TranslationService } from "@/services/translation/translation.service";

@Component({
  selector: "app-scroll-to-top",
  templateUrl: "./scroll-to-top.component.html",
  styleUrls: ["./scroll-to-top.component.scss"],
  standalone: false,
})
export class ScrollToTopComponent {
  constructor(
    protected translationService: TranslationService,
    private router: Router,
    private platformService: PlatformService,
  ) {}

  @Input({ required: true }) pagesScrolled!: number;

  scrollToTop() {
    if (this.platformService.isBrowser) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  getRouterLink() {
    // Remove the last query fragment
    const routeFragments = this.router.url.split("#").slice(0, -1);
    return routeFragments.join("#");
  }
}
