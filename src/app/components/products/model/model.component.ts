import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Model } from './model.data';
import { Translation } from 'src/app/app.translations';

const SMALL_SCREEN_SIZE = 830;

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
  innerWidth!: number;
  smallScreenSize = SMALL_SCREEN_SIZE;

  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.modelDescription =
      this.translations.products.modelDescriptions[this.modelNumber - 1] ??
      this.translations.products.temporaryModelDescription;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
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
