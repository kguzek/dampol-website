import { Component, HostListener, OnInit } from '@angular/core';
import { TranslationService } from '../../translation.service';
import { TINY_SCREEN_SIZE_PX } from '../../app.constants';

function isMobileLayout() {
  try {
    return window.innerWidth <= TINY_SCREEN_SIZE_PX;
  } catch {
    console.warn(
      'Could not determine window width. If you are seeing this message, report it as a bug to @kguzek on GitHub.'
    );
    return false;
  }
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  standalone: false,
})
export class HeaderComponent implements OnInit {
  constructor(protected translationService: TranslationService) {}

  imageSrc!: string;

  @HostListener('window:resize')
  updateBackgroundImage() {
    this.imageSrc = isMobileLayout()
      ? 'assets/images/models/11/image-1.jpg'
      : 'assets/images/background.png';
  }

  ngOnInit() {
    this.updateBackgroundImage();
  }
}
