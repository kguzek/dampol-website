import { Component, Input } from '@angular/core';
import { TranslationService } from 'src/app/translation.service';

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
})
export class ScrollToTopComponent {
  constructor(protected translationService: TranslationService) {}

  @Input() pagesScrolled!: number;

  scrollToTop = scrollToTop;
}
