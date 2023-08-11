import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

const SELECT_FIRST_OPTION = '—— Select ——';

const DOOR_LOCATIONS = ['Front', 'Rear', 'Left', 'Right'];

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

const PATH_REGEXP = /\/model\/(?<modelNumber>\d{1,2})(?:#.+)?/;

const CURRENCY_FORMAT = Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
});

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit {
  constructor(private router: Router, private formBuilder: FormBuilder) {}

  doorLocations = [SELECT_FIRST_OPTION, ...DOOR_LOCATIONS];
  windowDimensions = [SELECT_FIRST_OPTION, ...WINDOW_DIMENSIONS];
  price = 52938;

  modelNumber = +(
    PATH_REGEXP.exec(this.router.url)?.groups?.['modelNumber'] ?? 1
  );

  createDoor = () =>
    this.formBuilder.group({
      location: [0],
      material: [''],
    });

  createWindow = () =>
    this.formBuilder.group({
      dimensions: [0],
      material: [''],
      windowGlaze: [''],
    });

  form = this.formBuilder.group({
    dimensions: this.formBuilder.group({
      length: [2],
      width: [2],
    }),
    features: this.formBuilder.group({
      bathroom: [false],
      shower: [false],
      kitchen: [false],
      walledOffKitchen: [false],
      partitionWallDoor: [false],
    }),
    additionalDoors: [false],
    doors: this.formBuilder.array([this.createDoor()]),
    windows: this.formBuilder.array([this.createWindow()]),
  });

  doors = this.form.controls.doors;
  windows = this.form.controls.windows;

  ngOnInit() {
    const walledOffKitchen = this.form.controls.features.get(
      'walledOffKitchen'
    ) as FormControl;
    walledOffKitchen.disable();

    this.form.valueChanges.subscribe((value) => {
      if (value.features?.kitchen === walledOffKitchen.disabled) {
        if (value.features?.kitchen) {
          walledOffKitchen.enable();
        } else {
          walledOffKitchen.disable();
        }
      }
    });
  }

  formatCurrency = (value: number) => CURRENCY_FORMAT.format(value);

  /** Returns '?' if the value is `undefined`, else formats it to one decimal place and adds 'm' unit. */
  formatDimension = (value?: number | null) =>
    value == null ? '?' : value.toFixed(1) + ' m';

  submit() {
    if (!this.form.valid) {
      this.price = 0;
      return;
    }
  }
}
