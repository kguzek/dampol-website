import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { scrollToTop } from '../scroll-to-top/scroll-to-top.component';

const PATHS = ['products', 'about', 'contact'];

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}

  elements: { [elementId: string]: Element } = {};
  fragment: string | null = null;
  changingFragment = false;
  scrollingTo?: string | null = null;

  onFragmentChange(fragment: string | null) {
    this.fragment = fragment;
    if (this.changingFragment) return void (this.changingFragment = false);
    this.scrollingTo = fragment;
    if (fragment === null) {
      return scrollToTop();
    }
    this.elements[fragment].scrollIntoView({ behavior: 'smooth' });
  }

  ngOnInit() {
    this.elements = Object.fromEntries(
      PATHS.map((path) => [path, document.getElementById(path) as Element])
    );

    this.route.fragment.subscribe((fragment) =>
      this.onFragmentChange(fragment)
    );
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateWindowScroll() {
    let page = null;
    for (const [elementId, element] of Object.entries(this.elements)) {
      if (element.getBoundingClientRect().top / window.innerHeight > 0.7)
        continue;
      page = elementId;
    }
    if (page === this.fragment) {
      // The scrolling animation has concluded and the page location matches the fragment
      this.scrollingTo = undefined;
      return;
    }
    // The scroll animation is currently taking place, so the page location doesn't match the fragment
    // Don't do anything and wait for the scroll to finish
    if (this.fragment === this.scrollingTo) return;

    this.changingFragment = true;
    this.router.navigate(['/'], {
      replaceUrl: true,
      fragment: page || undefined,
    });
  }
}
