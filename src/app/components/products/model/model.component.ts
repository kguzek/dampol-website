import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Model } from './model.data';
import { Translation } from 'src/app/app.translations';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit {
  @Input() modelNumber!: number;
  @Input() model!: Model;
  @Input() translations!: Translation;
  @ViewChild('imageScroller') imageScroller!: ElementRef;

  modelDescription!: string;
  selectedImage = 1;

  ngOnInit() {
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

  navigate(event: MouseEvent) {
    const elem = this.imageScroller.nativeElement as Element;
    if (elem.contains(event.target as Node)) return;
    console.log('clicked');
  }
}
