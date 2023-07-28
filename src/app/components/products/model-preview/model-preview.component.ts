import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Model } from '../model.data';
import { TranslationService } from 'src/app/translation.service';

@Component({
  selector: 'app-model-preview',
  templateUrl: './model-preview.component.html',
  styleUrls: ['./model-preview.component.scss'],
})
export class ModelPreviewComponent implements OnInit {
  @Input() modelNumber!: number;
  @Input() model!: Model;
  constructor(protected translationService: TranslationService) {}
  @ViewChild('imageScroller') imageScroller!: ElementRef;

  modelDescription!: string;
  selectedImage = 1;

  ngOnInit() {
    this.modelDescription =
      this.translationService.translations.products.modelDescriptions[
        this.modelNumber - 1
      ] ??
      this.translationService.translations.products.temporaryModelDescription;
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
