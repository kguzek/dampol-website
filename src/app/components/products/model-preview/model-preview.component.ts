import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MODELS, Model } from '../model.data';
import { TranslationService } from 'src/app/translation.service';

@Component({
  selector: 'app-model-preview',
  templateUrl: './model-preview.component.html',
  styleUrls: ['./model-preview.component.scss'],
})
export class ModelPreviewComponent implements OnInit {
  constructor(protected translationService: TranslationService) {}

  @Input() modelNumber!: number;
  @ViewChild('imageScroller') imageScroller!: ElementRef;

  selectedImage = 1;
  model!: Model;

  ngOnInit() {
    this.model = MODELS[this.modelNumber - 1];
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
