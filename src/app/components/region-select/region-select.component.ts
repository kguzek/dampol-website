import { KeyValuePipe } from "@angular/common";
import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { TranslationService } from "src/app/services/translation/translation.service";

import { RegionService } from "@/services/region/region.service";

import { LanguageSelectComponent } from "../navbar/language-select/language-select.component";

@Component({
  imports: [KeyValuePipe, LanguageSelectComponent, MatIconModule],
  selector: "app-region-select",
  templateUrl: "./region-select.component.html",
  styleUrl: "./region-select.component.scss",
})
export class RegionSelectComponent {
  constructor(
    protected translationService: TranslationService,
    protected regionService: RegionService,
  ) {}
}
