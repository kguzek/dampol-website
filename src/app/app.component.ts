import { Component } from '@angular/core';
import { LanguageCode, TRANSLATIONS } from './app.translations';
import { KeyValue } from '@angular/common';

// Preserve original property order
export const originalOrder = (
  a: KeyValue<string, string>,
  b: KeyValue<string, string>
): number => 0;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'dampol-website';
  selectedLanguage: LanguageCode = (localStorage.getItem('language') ||
    'gb') as LanguageCode;
  translations = TRANSLATIONS[this.selectedLanguage];

  setSelectedLanguage(language: string) {
    this.selectedLanguage = language as LanguageCode;
    this.translations = TRANSLATIONS[this.selectedLanguage];
    localStorage.setItem('language', language);
  }
}
