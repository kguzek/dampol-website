import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { TranslationService } from "src/app/services/translation/translation.service";

export function scrollToTop() {
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.warn(
      "Could not scroll to top. If you are seeing this message, report it as a bug to @kguzek on GitHub.",
      error,
    );
    return;
  }
}

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
  ) {}

  @Input() pagesScrolled!: number;

  scrollToTop = scrollToTop;

  getRouterLink() {
    // Remove the last query fragment
    const routeFragments = this.router.url.split("#").slice(0, -1);
    return routeFragments.join("#");
  }
}
