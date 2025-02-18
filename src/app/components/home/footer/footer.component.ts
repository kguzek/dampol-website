import { Component } from "@angular/core";
import { TranslationService } from "src/app/services/translation/translation.service";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
  standalone: false,
})
export class FooterComponent {
  constructor(protected translationService: TranslationService) {}
}
