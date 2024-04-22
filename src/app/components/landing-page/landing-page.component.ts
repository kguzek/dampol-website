import { Component, HostListener, OnInit } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { TINY_SCREEN_SIZE_PX } from '../../app.constants';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(protected translationService: TranslationService) {}

  imageSrc!: string;

  @HostListener('window:resize')
  updateBackgroundImage() {
    this.imageSrc =
      window.innerWidth <= TINY_SCREEN_SIZE_PX
        ? 'assets/images/models/11/image-1.jpg'
        : 'assets/images/background.png';
  }

  ngOnInit() {
    this.updateBackgroundImage();
  }
}
