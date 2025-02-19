import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";

import { warnInProduction } from "@/lib/logging";
import { RegionService } from "@/services/region/region.service";
import { TranslationService } from "@/services/translation/translation.service";

import { Model, MODELS } from "../model.data";

@Component({
  selector: "app-model-preview",
  templateUrl: "./model-preview.component.html",
  styleUrls: ["./model-preview.component.scss"],
  standalone: false,
})
export class ModelPreviewComponent implements OnInit {
  constructor(
    protected translationService: TranslationService,
    protected regionService: RegionService,
  ) {}

  @Input() modelNumber!: number;
  @Input() isFullPage = false;
  @ViewChild("imageCarousel") imageCarousel!: ElementRef;

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
    try {
      document.getElementById(imageId)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    } catch (error) {
      warnInProduction(
        "Could not scroll to model image. If you are seeing this message, report it as a bug to @kguzek on GitHub.",
        error,
      );
    }
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
