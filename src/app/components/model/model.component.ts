import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/translation.service';
import { LayeredInput } from './input-layered/input-layered.component';
import { DOOR_LOCATIONS, MODEL_COMPONENT_PRICES } from 'src/app/app.constants';
import {
  DEFAULT_PHONE_NUMBER_VALUE,
  PHONE_NUMBER_VALIDATOR,
  PhoneNumber,
} from '../input-tel/input-tel.component';

const DEFAULT_LAYERED_INPUT_VALUE: LayeredInput = {
  base: false,
  extra: false,
  price: { price: 0, approximate: false },
};

const FEATURE_DESCRIPTIONS = {
  toilet: 'shower',
  kitchen: 'separation wall',
  partitionWall: 'internal door',
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

const DROPDOWN_VALIDATOR = (control: FormControl) =>
  +control.value === 0 ? { error: 'required' } : null;

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
      location: [location, { validators: [DROPDOWN_VALIDATOR] }],
      material: [material],
    });

  createWindow = (
    dimensions: number = 0,
    material: Window['material'] = '',
    glazure: Window['glazure'] = ''
  ) =>
    this.formBuilder.group({
      dimensions: [dimensions, { validators: [DROPDOWN_VALIDATOR] }],
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
    customerInformation: this.formBuilder.group({
      name: [''],
      phoneNumber: [
        DEFAULT_PHONE_NUMBER_VALUE,
        { validators: [PHONE_NUMBER_VALIDATOR] },
      ],
    }),
  });

  doors = this.form.controls.doors;
  windows = this.form.controls.windows;

  getDropdownOptions(menu: 'windows' | 'doors') {
    const options =
      menu === 'windows'
        ? WINDOW_DIMENSIONS
        : this.translationService.translations.model.doorLocations;
    return [
      `— ${this.translationService.translations.model.select} —`,
      ...options,
    ];
  }

  /** Returns '?' if the value is `undefined`, else formats it to one decimal place and adds 'm' unit. */
  formatDimension = (value?: number | null) => (value ?? 0).toFixed(1) + ' m';

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
    if (this.form.invalid) {
      document
        .querySelector('.image-scroller')
        ?.scrollIntoView({ behavior: 'smooth' });
      this.form.markAllAsTouched();
      return;
    }
    window.open(this.getSubmitHref(), '_blank');
  }

  getSubmitHref() {
    const value = this.form.value;
    const orderTimestamp = new Date().toLocaleString('en-GB', {
      dateStyle: 'short',
      timeStyle: 'long',
    });
    const featureDescriptions: string[] = [];
    for (const [featureName, featureValue] of Object.entries(
      value.features ?? {}
    )) {
      if (!featureValue?.base) continue;
      const featureKey = featureName as keyof typeof FEATURE_DESCRIPTIONS;
      const featureDetail = FEATURE_DESCRIPTIONS[featureKey].replace(
        ' ',
        '%20'
      );
      featureDescriptions.push(
        `${featureName}%20${
          featureValue.extra ? 'with' : 'without'
        }%20${featureDetail}`
      );
    }
    const doorDescriptions = (value.doors ?? []).map(
      (door, idx) =>
        `${idx + 1}.%0D%0ALocation%3A%20${
          DOOR_LOCATIONS[(door.location as number) - 1]
        }%0D%0AMaterial%3A%20${door.material}`
    );
    const windowDescriptions = (value.windows ?? []).map(
      (window, idx) =>
        `${idx + 1}.%0D%0ADimensions%3A%20${WINDOW_DIMENSIONS[
          (window.dimensions as number) - 1
        ].replace(' ', '%20')}%0D%0AMaterial%3A%20${
          window.material
        }%0D%0AGlazure%3A%20${window.glazure}`
    );
    const encodedPrice = encodeURIComponent(
      this.translationService.formatPrice(this.totalPrice)
    );
    const encodedName = encodeURIComponent(
      value.customerInformation?.name ?? ''
    );
    const encodedPhoneNumber = encodeURIComponent(
      (value.customerInformation?.phoneNumber as PhoneNumber).value
    );
    return `mailto:dampol.sales@gmail.com?subject=Online%20container%20order%20-%20${encodedName}&body=\
Order%20Information%0D%0AModel%20number%3A%20Model%20${this.modelNumber}%0D%0A\
I.%20Dimensions%3A%20${value.dimensions?.length}%20m%20×%20${
      value.dimensions?.width
    }%20m%0D%0A\
II.%20Features%3A%20${featureDescriptions.join('%2C%20') || 'none'}%0D%0A\
III.%20Doors%3A%0D%0A${doorDescriptions.join('%0D%0A')}%0D%0A%0D%0A\
IV.%20Windows%3A%0D%0A${windowDescriptions.join('%0D%0A')}%0D%0A%0D%0A\
Estimated%20price%3A%20${encodedPrice}%0D%0A%0D%0A\
V.%20Customer%20information%3A%0D%0AName%3A%20${encodedName}%0D%0APhone%20number%3A%20${encodedPhoneNumber}%0D%0A%0D%0A\
Order%20timestamp%3A%20${orderTimestamp}`;
  }
}
