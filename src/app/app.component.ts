import { Component, HostListener } from '@angular/core';
import { KeyValue } from '@angular/common';
import { scrollToTop } from './components/scroll-to-top/scroll-to-top.component';
import { ActivatedRoute, EventType, Router } from '@angular/router';

const FRAGMENTS = ['products', 'about', 'contact'];

// Preserve original property order
export const originalOrder = (
  _a: KeyValue<string, string>,
  _b: KeyValue<string, string>
): number => 0;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

  title = 'dampol-website';
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
        scrollToTop();
        return;
      }
      try {
        const element = document.getElementById(this.fragment) as Element;
        element.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        console.warn(
          'Could not scroll to element. If you are seeing this message, report it as a bug to @kguzek on GitHub.',
          error
        );
      }
    });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowScroll() {
    try {
      this.pagesScrolled = window.scrollY / window.innerHeight;
    } catch (error) {
      console.warn(
        'Could not determine window scroll position. If you are seeing this message, report it as a bug to @kguzek on GitHub.',
        error
      );
    }

    // Handle changing the URL fragment when the user reaches a given position on the screen
    let page = null;
    for (const fragment of FRAGMENTS) {
      let element;
      try {
        element = document.getElementById(fragment);
      } catch (error) {
        console.warn(
          'Could not determine element position. If you are seeing this message, report it as a bug to @kguzek on GitHub.',
          error
        );
        return;
      }
      if (!element) continue;
      const elementOffset = element.getBoundingClientRect().top;
      if (fragment === 'about') this.passedAboutPage = elementOffset <= 100;
      try {
        if (elementOffset / window.innerHeight > 0.7) continue;
      } catch (error) {
        console.warn(
          'Could not determine window height. If you are seeing this message, report it as a bug to @kguzek on GitHub.',
          error
        );
      }
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
