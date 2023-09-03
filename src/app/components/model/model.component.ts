import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/translation.service';
import { LayeredInput } from './input-layered/input-layered.component';

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

const DROPDOWN_INPUT = [
  0,
  [(control: FormControl) => (+control.value === 0 ? { error: '' } : null)],
];

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

  createDoor = () =>
    this.formBuilder.group({
      location: DROPDOWN_INPUT,
      material: [''],
    });

  createWindow = () =>
    this.formBuilder.group({
      dimensions: DROPDOWN_INPUT,
      material: [''],
      windowGlaze: [''],
    });

  form = this.formBuilder.group({
    dimensions: this.formBuilder.group({
      length: [2],
      width: [2],
    }),
    features: this.formBuilder.group({
      toilet: [DEFAULT_LAYERED_INPUT_VALUE],
      kitchen: [DEFAULT_LAYERED_INPUT_VALUE],
      partitionWall: [DEFAULT_LAYERED_INPUT_VALUE],
    }),
    doors: this.formBuilder.array([this.createDoor()]),
    windows: this.formBuilder.array([this.createWindow()]),
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

  getContainerPrice() {
    let price = 0;
    for (const feature in this.form.value.features) {
      const control = this.form.controls.features.get(feature);
      price += control?.value.price.price;
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
