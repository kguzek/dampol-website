import { Component, Input } from '@angular/core';
import { Translation } from 'src/app/app.translations';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  @Input() translations!: Translation;
}
