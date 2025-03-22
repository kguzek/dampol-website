import type { AfterViewInit, ElementRef } from "@angular/core";
import { Component, Input, ViewChild } from "@angular/core";
import { MatIcon } from "@angular/material/icon";
import { v4 as uuidv4 } from "uuid";

import { PlatformService } from "@/services/platform/platform.service";
import { TranslationService } from "@/services/translation/translation.service";

export interface Image {
  src: string;
  alt: string;
  video?: false;
}
export interface Video {
  src: string;
  type: string;
  video: true;
}
export type Media = Image | Video;

@Component({
  selector: "app-carousel",
  imports: [MatIcon],
  templateUrl: "./carousel.component.html",
  styleUrl: "./carousel.component.scss",
})
export class CarouselComponent implements AfterViewInit {
  @Input({ required: true }) media!: Media[];
  @ViewChild("carousel") carousel!: ElementRef;
  protected id = uuidv4();
  selectedImageIndex = 0;

  constructor(
    protected translationService: TranslationService,
    private platformService: PlatformService,
  ) {}

  ngAfterViewInit(): void {
    this.selectedImageIndex = this.getSelectedImageIndex() || 0;
  }

  getMediaId(imageIndex: number) {
    return `carousel-${this.id}-${imageIndex}`;
  }

  getSelectedImageIndex() {
    const target = this.carousel.nativeElement;
    const imageWidth = target.scrollWidth / this.media.length;
    return Math.round(target.scrollLeft / imageWidth);
  }

  scrollToImage(index?: number) {
    if (this.platformService.isServer) return;
    const imageIndex = index ?? this.selectedImageIndex;
    const imageId = this.getMediaId(imageIndex);
    document.getElementById(imageId)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }

  nextImage() {
    if (this.selectedImageIndex >= this.media.length - 1) {
      this.selectedImageIndex = 0;
    } else {
      this.selectedImageIndex++;
    }
    this.scrollToImage();
  }

  previousImage() {
    if (this.selectedImageIndex <= 0) {
      this.selectedImageIndex = this.media.length - 1;
    } else {
      this.selectedImageIndex--;
    }
    this.scrollToImage();
  }
}
