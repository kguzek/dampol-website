import { Component } from "@angular/core";

import { TranslationService } from "@/services/translation/translation.service";

import { MODELS } from "./model.data";

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
