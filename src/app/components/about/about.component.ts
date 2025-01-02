import { Component } from '@angular/core';
import { TranslationService } from 'src/app/translation.service';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    standalone: false
})
export class AboutComponent {
  constructor(protected translationService: TranslationService) {}
}
