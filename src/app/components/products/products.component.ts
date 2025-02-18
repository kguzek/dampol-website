import { Component } from "@angular/core";
import { MODELS } from "./model.data";
import { TranslationService } from "src/app/services/translation/translation.service";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.scss"],
  standalone: false,
})
export class ProductsComponent {
  constructor(protected translationService: TranslationService) {}

  models = MODELS;
}
