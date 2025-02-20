import { KeyValue } from "@angular/common";
import { Component, HostListener, ViewChild } from "@angular/core";
import { ActivatedRoute, EventType, Router } from "@angular/router";

import { ScrollToTopComponent } from "./components/scroll-to-top/scroll-to-top.component";
import { PlatformService } from "./services/platform/platform.service";

const FRAGMENTS = ["products", "about", "contact"];

/** Preserve original sort order */
export const originalOrder = (_a: KeyValue<string, string>, _b: KeyValue<string, string>): number => 0;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  standalone: false,
})
export class AppComponent {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private platformService: PlatformService,
  ) {}

  @ViewChild(ScrollToTopComponent) scrollToTop!: ScrollToTopComponent;

  title = "dampol-website";
  pagesScrolled = 0;
  passedAboutPage = false;

  fragment: string | null = null;
  /** `true` if we are currently in the process of replacing the URL history with an updated fragment. */
  changingFragment = false;
  /** If we are artificially scrolling for the user upon clicking a navigation link, this has the value of the fragment being scrolled to
   *  (or `null` if we are scrolling to the top). Otherwise, this is `undefined`.
   */
  scrollingTo?: string | null = null;

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      this.fragment = fragment;
      if (!this.changingFragment) this.scrollingTo = fragment;
    });

    this.router.events.subscribe((event) => {
      if (event.type !== EventType.Scroll) return;
      if (this.changingFragment) {
        this.changingFragment = false;
        return;
      }
      if (this.fragment === null) {
        this.scrollToTop.scrollToTop();
        return;
      }
      if (this.platformService.isBrowser) {
        const element = document.getElementById(this.fragment) as Element;
        element.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  @HostListener("window:scroll")
  @HostListener("window:resize")
  onWindowScroll() {
    if (this.platformService.isServer) return;
    this.pagesScrolled = window.scrollY / window.innerHeight;

    // Handle changing the URL fragment when the user reaches a given position on the screen
    let page = null;

    if (this.platformService.isServer) {
      return;
    }
    for (const fragment of FRAGMENTS) {
      const element = document.getElementById(fragment);
      if (!element) continue;
      const elementOffset = element.getBoundingClientRect().top;
      if (fragment === "about") this.passedAboutPage = elementOffset <= 100;
      if (elementOffset / window.innerHeight > 0.7) continue;
      page = fragment;
    }
    if (page === this.fragment) {
      // The scroll animation has concluded and the scroll location matches the fragment
      this.scrollingTo = undefined;
      return;
    }
    // The scroll animation is currently taking place, so the scroll location doesn't match the fragment
    // Don't do anything and wait for the scroll to finish
    if (this.fragment === this.scrollingTo) return;

    this.changingFragment = true;
    this.router.navigate([], {
      replaceUrl: true,
      fragment: page || undefined,
    });
  }
}
