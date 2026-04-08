import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import type { FeatureKey, Price } from "@/app.constants";
import { MODEL_COMPONENT_PRICES } from "@/app.constants";
import { RegionService } from "@/services/region/region.service";
import { TranslationService } from "@/services/translation/translation.service";

export type PriceDecorator = "none" | "from" | "each";

export interface FeatureInput {
  selected: boolean;
  price: Price;
}

@Component({
  selector: "app-input-feature",
  templateUrl: "./input-feature.component.html",
  styleUrls: ["./input-feature.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFeatureComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class InputFeatureComponent implements ControlValueAccessor, OnInit {
  constructor(
    public translationService: TranslationService,
    private regionService: RegionService,
  ) {}

  @Input({ required: true }) formControlName!: FeatureKey;
  @Input({ required: true }) label!: string;
  @Input() priceDecorator: PriceDecorator = "none";

  onChange!: () => void;
  onTouched!: () => void;

  value: boolean = false;
  private priceValue!: number | Price;

  ngOnInit(): void {
    const feature = this.formControlName;
    this.priceValue = MODEL_COMPONENT_PRICES.features[feature][0];
  }

  registerOnChange(fn: (value: FeatureInput) => void): void {
    this.onChange = () => {
      fn({
        selected: this.value,
        price: this.getPrice(),
      });
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: FeatureInput): void {
    this.value = value.selected;
  }

  getPrice(): Price {
    let price = 0;
    let approximate = false;

    if (this.value) {
      if (typeof this.priceValue === "object" && this.priceValue !== null) {
        price = this.priceValue.price;
        approximate = this.priceValue.approximate;
      } else {
        price = this.priceValue as number;
      }
    }

    return { price: this.regionService.localisePricePLN(price), approximate } as Price;
  }

  formatPrice(value: Price): string {
    const formattedPrice = this.regionService.formatPrice(value.price, false);
    return `+ ${formattedPrice}`;
  }

  getPriceDecoratorText(): string {
    switch (this.priceDecorator) {
      case "from":
        return "(min.) ";
      case "each": {
        const each = this.translationService.translations.model.priceDecorators?.each ?? "ea.";
        return `(${each})`;
      }
      default:
        return "";
    }
  }
}
