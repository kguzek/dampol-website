import { Component, Input } from '@angular/core';
import { Translation } from 'src/app/app.translations';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  @Input() translations!: Translation;
}
