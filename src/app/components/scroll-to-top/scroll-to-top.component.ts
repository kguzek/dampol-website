import { Component, HostListener, Input } from '@angular/core';
import { Translation } from 'src/app/app.translations';

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
})
export class ScrollToTopComponent {
  @Input() translations!: Translation;

  visible = false;

  scrollToTop() {
    console.log('aaa');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll')
  checkVisibility() {
    this.visible = window.scrollY > 200;
  }
}
