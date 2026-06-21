import { ChangeDetectionStrategy, Component } from "@angular/core";

import { TranslationService } from "@/services/translation/translation.service";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class FooterComponent {
  constructor(protected translationService: TranslationService) {}
}
