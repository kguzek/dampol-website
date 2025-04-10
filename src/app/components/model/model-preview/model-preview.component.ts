import { Component, Input } from "@angular/core";

import type { Media } from "@/components/carousel/carousel.component";
import type { Model } from "@/services/model/model.service";
import { DIRECTUS_API_URL } from "@/app.constants";
import { ModelService } from "@/services/model/model.service";
import { RegionService } from "@/services/region/region.service";
import { TranslationService } from "@/services/translation/translation.service";

@Component({
  selector: "app-model-preview",
  templateUrl: "./model-preview.component.html",
  styleUrls: ["./model-preview.component.scss"],
  standalone: false,
})
export class ModelPreviewComponent {
  constructor(
    protected translationService: TranslationService,
    protected regionService: RegionService,
    private modelService: ModelService,
  ) {}

  @Input({ required: true }) model!: Model;
  @Input() isFullPage = false;

  modelImages!: Media[];
  ngOnInit() {
    const width = this.isFullPage ? 1000 : 520;
    const quality = this.isFullPage ? 100 : 60;
    this.model = this.modelService.modelsById[this.model.id];
    this.modelImages = this.model.images.map((image, i) => ({
      src: `${DIRECTUS_API_URL}/assets/${image.directus_files_id}?width=${width}&format=webp&quality=${quality}`,
      alt: `Model ${this.model.id} Image ${i + 1}`,
    }));
  }
}
