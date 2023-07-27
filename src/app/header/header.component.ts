import { Component, Input } from '@angular/core';
import { Translation } from '../app.translations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() translations!: Translation;

  scroll() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }
}
