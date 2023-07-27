import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Translation } from '../app.translations';
import { TINY_SCREEN_SIZE_PX } from '../app.constants';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() translations!: Translation;

  imageSrc!: string;

  scroll() {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  }

  @HostListener('window:resize')
  updateBackgroundImage() {
    this.imageSrc =
      window.innerWidth <= TINY_SCREEN_SIZE_PX
        ? 'assets/images/models/12/model-12-image-1.jpg'
        : 'assets/images/background.png';
  }

  ngOnInit() {
    this.updateBackgroundImage();
  }
}
