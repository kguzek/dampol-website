import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/translation.service';
import { LayeredInput } from './input-layered/input-layered.component';
import { MODEL_COMPONENT_PRICES } from 'src/app/app.constants';

const DEFAULT_LAYERED_INPUT_VALUE: LayeredInput = {
  base: false,
  extra: false,
  price: { price: 0, approximate: false },
};

const WINDOW_DIMENSIONS = [
  [50, 50],
  [60, 90],
  [100, 100],
  [90, 190],
  [100, 200],
  [200, 200],
].map((dimensions) =>
  dimensions.map((dimension) => `${dimension} cm`).join(' × ')
);

const PATH_REGEXP = /\/model\/(?<modelNumber>\d+)(?:#.+)?/;

const DROPDOWN_VALIDATORS = {
  validators: [
    (control: FormControl) =>
      +control.value === 0 ? { error: 'required' } : null,
  ],
};

interface Window {
  dimensions: number;
  material: 'aluminium' | 'pcv' | 'fixed' | '';
  glazure: 'double' | 'triple' | '';
}

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent {
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public translationService: TranslationService
  ) {}

  modelNumber = +(
    PATH_REGEXP.exec(this.router.url)?.groups?.['modelNumber'] ?? 1
  );

  createDoor = (location: number = 0, material: string = '') =>
    this.formBuilder.group({
      location: [location, DROPDOWN_VALIDATORS],
      material: [material],
    });

  createWindow = (
    dimensions: number = 0,
    material: Window['material'] = '',
    glazure: Window['glazure'] = ''
  ) =>
    this.formBuilder.group({
      dimensions: [dimensions, DROPDOWN_VALIDATORS],
      material: [material],
      glazure: [glazure],
    });

  form = this.formBuilder.group({
    dimensions: this.formBuilder.group({
      length: [6],
      width: [3],
    }),
    features: this.formBuilder.group({
      toilet: [DEFAULT_LAYERED_INPUT_VALUE],
      kitchen: [DEFAULT_LAYERED_INPUT_VALUE],
      partitionWall: [DEFAULT_LAYERED_INPUT_VALUE],
    }),
    doors: this.formBuilder.array([this.createDoor(1, 'aluminiumGlass')]),
    windows: this.formBuilder.array([this.createWindow(4, 'pcv', 'double')]),
  });

  doors = this.form.controls.doors;
  windows = this.form.controls.windows;

  getDropdownOptions(menu: 'windows' | 'doors') {
    const options =
      menu === 'windows'
        ? WINDOW_DIMENSIONS
        : this.translationService.translations.model.doorLocations;
    return [
      `—— ${this.translationService.translations.model.select} ——`,
      ...options,
    ];
  }

  /** Returns '?' if the value is `undefined`, else formats it to one decimal place and adds 'm' unit. */
  formatDimension = (value?: number | null) =>
    value == null ? '?' : value.toFixed(1) + ' m';

  getDoorPrice(doorIdx: number) {
    const door = this.form.value.doors?.[doorIdx];
    const material = door?.material as string;
    if (!Object.keys(MODEL_COMPONENT_PRICES.doors).includes(material))
      return NaN;
    return MODEL_COMPONENT_PRICES.doors[
      material as keyof typeof MODEL_COMPONENT_PRICES.doors
    ];
  }

  getWindow = (windowIdx: number) =>
    this.form.value.windows?.[windowIdx] as Window;

  getWindowDimensionsPrice(window: Window) {
    if (!window.dimensions) return NaN;
    const dimensionsIdx = (window.dimensions as number) - 1;
    return MODEL_COMPONENT_PRICES.windows.dimensionPrices[dimensionsIdx];
  }

  getWindowMaterialMultiplier(window: Window) {
    if (!window.material) return NaN;
    return MODEL_COMPONENT_PRICES.windows.materialMultipliers[window.material];
  }

  getWindowPrice(window: Window) {
    if (!window.glazure) return NaN;
    let price = this.getWindowDimensionsPrice(window);
    price *= this.getWindowMaterialMultiplier(window);
    if (window.glazure === 'triple') {
      price *= MODEL_COMPONENT_PRICES.windows.tripleGlazedMultiplier;
    }
    return price;
  }

  formatMultiplier(multiplier: number) {
    if (isNaN(multiplier) || multiplier === 1) return '';
    const result = (multiplier - 1) * 100;
    return `${result > 0 ? '+' : ''}${result}%`;
  }

  get dimensionsPrice() {
    const prices = MODEL_COMPONENT_PRICES.dimensions;

    let price = 2300;
    const dimensions = this.form.value.dimensions;
    const length = dimensions?.length ?? 0;
    const width = dimensions?.width ?? 0;
    price +=
      length < prices.lengthCutoff
        ? length * prices.lengthUnitPrice * prices.lengthMultiplierUnderCutoff
        : prices.lengthCutoff *
            prices.lengthUnitPrice *
            prices.lengthMultiplierUnderCutoff +
          (length - prices.lengthCutoff) * prices.lengthUnitPrice;
    price += width * prices.widthUnitPrice;
    price += (Math.ceil(width / 3) - 1) * prices.additionalContainerWidthPrice;
    return price;
  }

  get totalPrice() {
    let price = this.dimensionsPrice;
    for (const feature in this.form.value.features) {
      const control = this.form.controls.features.get(feature);
      price += control?.value.price.price;
    }
    for (let i = 0; i < (this.form.value.doors?.length ?? 0); i++) {
      const doorPrice = this.getDoorPrice(i);
      if (!isNaN(doorPrice)) price += doorPrice;
    }
    for (let i = 0; i < (this.form.value.windows?.length ?? 0); i++) {
      const window = this.getWindow(i);
      const windowPrice = this.getWindowPrice(window);
      if (!isNaN(windowPrice)) price += windowPrice;
    }
    return price;
  }

  submit() {
    if (!this.form.valid) {
      document
        .querySelector('.image-scroller')
        ?.scrollIntoView({ behavior: 'smooth' });
      this.form.markAllAsTouched();
      return;
    }
  }
}
