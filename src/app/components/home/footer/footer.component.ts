import { Component } from "@angular/core";

import { RegionService } from "@/services/region/region.service";
import { TranslationService } from "@/services/translation/translation.service";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
  standalone: false,
})
export class FooterComponent {
  constructor(
    protected translationService: TranslationService,
    protected regionService: RegionService,
  ) {}
}
