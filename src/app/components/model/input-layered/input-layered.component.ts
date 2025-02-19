import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { MODEL_COMPONENT_PRICES, Price } from "@/app.constants";
import { RegionService } from "@/services/region/region.service";
import { TranslationService } from "@/services/translation/translation.service";

const isPrice = (price: number | Price): price is Price => {
  return (price as any).approximate !== undefined;
};

export interface LayeredInput {
  base: boolean;
  extra: boolean;
  price: Price;
}

@Component({
  selector: "app-input-layered",
  templateUrl: "./input-layered.component.html",
  styleUrls: ["./input-layered.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputLayeredComponent),
      multi: true,
    },
  ],
  standalone: false,
})
export class InputLayeredComponent implements ControlValueAccessor, OnInit {
  constructor(
    public translationService: TranslationService,
    private regionService: RegionService,
  ) {}

  @Input({ required: true }) formControlName!: string;
  @Input({ required: true }) outerLabel!: string;
  @Input({ required: true }) innerLabel!: string;

  onChange!: () => void;
  onTouched!: () => void;

  outerValue: boolean = false;
  innerValue: boolean = false;
  private prices!: (number | Price)[];

  ngOnInit(): void {
    const feature = this.formControlName as keyof typeof MODEL_COMPONENT_PRICES.features;
    this.prices = MODEL_COMPONENT_PRICES.features[feature];
  }

  registerOnChange(fn: (value: LayeredInput) => void): void {
    this.onChange = () => {
      fn({
        base: this.outerValue,
        extra: this.innerValue,
        price: this.getPrice(),
      });
    };
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: LayeredInput): void {
    this.outerValue = value.base;
    this.innerValue = value.extra;
  }

  getPrice() {
    let price = 0;
    let approximate = false;
    for (const value of this.prices) {
      if (!this.outerValue) break;
      if (isPrice(value)) {
        price += value.price;
        approximate = true;
      } else {
        price += value;
      }
      if (!this.innerValue) break;
    }
    return { price, approximate } as Price;
  }

  formatPrice(value: Price) {
    const formattedPrice = this.regionService.formatPrice(value.price, false);
    return `${value.approximate ? "⨤" : "+"} ${formattedPrice}`;
  }
}
