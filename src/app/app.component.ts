import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LanguageCode, TRANSLATIONS } from './app.translations';
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
export class AppComponent implements OnInit {
  title = 'dampol-website';
  selectedLanguage: LanguageCode = (localStorage.getItem('language') ||
    'gb') as LanguageCode;
  translations = TRANSLATIONS[this.selectedLanguage];
  pagesScrolled = 0;
  passedAboutPage = false;

  aboutElem: Element | null = null;

  setSelectedLanguage(language: string) {
    this.selectedLanguage = language as LanguageCode;
    this.translations = TRANSLATIONS[this.selectedLanguage];
    localStorage.setItem('language', language);
    window.location.reload();
  }

  ngOnInit() {
    this.aboutElem = document.querySelector('#about');
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  updateWindowScroll() {
    this.pagesScrolled = window.scrollY / window.innerHeight;
    const aboutOffset = this.aboutElem?.getBoundingClientRect()?.top ?? 0;
    this.passedAboutPage = aboutOffset <= 100;
  }
}
