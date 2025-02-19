import { KeyValuePipe } from "@angular/common";
import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

import { LanguageSelectComponent } from "@/components/navbar/language-select/language-select.component";
import { RegionService } from "@/services/region/region.service";
import { TranslationService } from "@/services/translation/translation.service";

@Component({
  imports: [KeyValuePipe, LanguageSelectComponent, MatIconModule],
  selector: "app-region-popup",
  templateUrl: "./region-popup.component.html",
  styleUrl: "./region-popup.component.scss",
})
export class RegionPopupComponent {
  constructor(
    protected translationService: TranslationService,
    protected regionService: RegionService,
  ) {}
}
