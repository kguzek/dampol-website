import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MODELS, Model } from '../model.data';
import { TranslationService } from 'src/app/translation.service';

@Component({
    selector: 'app-model-preview',
    templateUrl: './model-preview.component.html',
    styleUrls: ['./model-preview.component.scss'],
    standalone: false
})
export class ModelPreviewComponent implements OnInit {
  constructor(protected translationService: TranslationService) {}

  @Input() modelNumber!: number;
  @ViewChild('imageCarousel') imageCarousel!: ElementRef;

  selectedImage!: number;
  model!: Model;
  images!: number[];

  ngOnInit() {
    this.model = MODELS[this.modelNumber - 1];
    this.images = Array.from({ length: this.model.numImages }, (_, i) => i + 1);
  }

  ngAfterViewInit() {
    this.selectedImage = this.getSelectedImage();
  }

  getSelectedImage() {
    const target = this.imageCarousel.nativeElement;
    const imageWidth = target.scrollWidth / this.model.numImages;
    return Math.round(target.scrollLeft / imageWidth) + 1;
  }

  scrollToImage(imageNumber: number) {
    const imageId = `model-${this.modelNumber}-image-${imageNumber}`;
    document.getElementById(imageId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  nextImage() {
    if (this.selectedImage >= this.model.numImages) {
      this.scrollToImage(1);
    } else {
      this.scrollToImage(this.selectedImage + 1);
    }
  }

  previousImage() {
    if (this.selectedImage <= 1) {
      this.scrollToImage(this.model.numImages);
    } else {
      this.scrollToImage(this.selectedImage - 1);
    }
  }
}
