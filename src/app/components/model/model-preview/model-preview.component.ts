import { Component, Input, OnInit } from "@angular/core";

import type { Media } from "@/components/carousel/carousel.component";
import { Model, MODELS } from "@/components/model/model.data";
import { RegionService } from "@/services/region/region.service";
import { TranslationService } from "@/services/translation/translation.service";

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

  @Input({ required: true }) modelNumber!: number;
  @Input() isFullPage = false;

  model!: Model;
  modelImages!: Media[];

  ngOnInit() {
    this.model = MODELS[this.modelNumber - 1];
    this.modelImages = Array.from({ length: this.model.numImages }, (_, i) => ({
      src: `models/${this.modelNumber}/image-${i + 1}.jpg`,
      alt: `Model ${this.modelNumber} Image ${i + 1}`,
    }));
  }
}
