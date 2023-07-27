import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Model } from './model.data';
import { Translation } from 'src/app/app.translations';
import {
  LARGE_SCREEN_SIZE_PX,
  MEDIUM_SCREEN_SIZE_PX,
  SMALL_SCREEN_SIZE_PX,
} from 'src/app/app.constants';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit {
  @Input() modelNumber!: number;
  @Input() model!: Model;
  @Input() translations!: Translation;

  modelDescription!: string;
  selectedImage = 1;
  useMobileLayout = false;

  @HostListener('window:resize')
  checkIfShouldUseMobileLayout() {
    this.useMobileLayout =
      (window.innerWidth <= LARGE_SCREEN_SIZE_PX &&
        window.innerWidth > MEDIUM_SCREEN_SIZE_PX) ||
      window.innerWidth <= SMALL_SCREEN_SIZE_PX;
  }

  ngOnInit() {
    this.checkIfShouldUseMobileLayout();
    this.modelDescription =
      this.translations.products.modelDescriptions[this.modelNumber - 1] ??
      this.translations.products.temporaryModelDescription;
  }

  nextImage() {
    if (this.selectedImage >= this.model.numImages) {
      this.selectedImage = 1;
    } else {
      this.selectedImage += 1;
    }
  }

  previousImage() {
    if (this.selectedImage <= 1) {
      this.selectedImage = this.model.numImages;
    } else {
      this.selectedImage -= 1;
    }
  }
}
