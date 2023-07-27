import { Component, Input } from '@angular/core';
import { Translation } from 'src/app/app.translations';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
})
export class ScrollToTopComponent {
  @Input() translations!: Translation;
  @Input() pagesScrolled!: number;

  scrollToTop() {
    console.log('aaa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
