import { Component } from '@angular/core';
import { LanguageCode, TRANSLATIONS } from './app.translations';

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
