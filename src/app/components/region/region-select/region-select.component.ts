import { Component } from "@angular/core";

import { RegionService } from "@/services/region/region.service";
import { TranslationService } from "@/services/translation/translation.service";

@Component({
  selector: "app-region-select",
  imports: [],
  templateUrl: "./region-select.component.html",
  styleUrl: "./region-select.component.scss",
})
export class RegionSelectComponent {
  constructor(
    protected translationService: TranslationService,
    protected regionService: RegionService,
  ) {}
}
