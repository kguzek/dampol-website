import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/translation.service';

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

@Component({
    selector: 'app-scroll-to-top',
    templateUrl: './scroll-to-top.component.html',
    styleUrls: ['./scroll-to-top.component.scss'],
    standalone: false
})
export class ScrollToTopComponent {
  constructor(
    protected translationService: TranslationService,
    private router: Router
  ) {}

  @Input() pagesScrolled!: number;

  scrollToTop = scrollToTop;

  getRouterLink() {
    // Remove the last query fragment
    const routeFragments = this.router.url.split('#').slice(0, -1);
    return routeFragments.join('#');
  }
}
