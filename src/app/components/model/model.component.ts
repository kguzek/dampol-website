import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
// import { MODELS } from '../products/model.data';

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
export class ModelComponent {
  constructor(private router: Router) {}
  @ViewChild('form') form!: NgForm;
  windowDimensions = ['—— Select ——', ...WINDOW_DIMENSIONS];
  addAdditionalDoor = false;

  price = 52938;

  modelNumber = +(
    PATH_REGEXP.exec(this.router.url)?.groups?.['modelNumber'] ?? 1
  );

  formatCurrency = (value: number) => CURRENCY_FORMAT.format(value);

  submit() {
    if (!this.form.valid) {
      this.price = 0;
      return;
    }
  }
}
