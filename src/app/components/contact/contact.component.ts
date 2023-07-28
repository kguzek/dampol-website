import { Component } from '@angular/core';
import { TranslationService } from 'src/app/translation.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  constructor(protected translationService: TranslationService) {}
}
