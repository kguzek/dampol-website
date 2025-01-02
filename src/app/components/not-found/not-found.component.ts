import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/translation.service';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    standalone: false
})
export class NotFoundComponent {
  constructor(
    public router: Router,
    protected translationService: TranslationService
  ) {}
}
