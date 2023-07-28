import { AfterViewInit, Component, HostListener } from '@angular/core';
import { KeyValue } from '@angular/common';

// Preserve original property order
export const originalOrder = (
  _a: KeyValue<string, string>,
  _b: KeyValue<string, string>
): number => 0;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'dampol-website';
  pagesScrolled = 0;
  passedAboutPage = false;

  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateWindowScroll() {
    this.pagesScrolled = window.scrollY / window.innerHeight;
    const aboutElem = document.getElementById('about');
    const aboutOffset = aboutElem?.getBoundingClientRect()?.top;
    this.passedAboutPage = aboutOffset !== undefined && aboutOffset <= 100;
  }
}
