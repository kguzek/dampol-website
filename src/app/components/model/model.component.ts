import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MODELS } from '../products/model.data';

const PATH_REGEXP = /\/model\/(?<modelNumber>\d{1,2})(?:#.+)?/;

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent {
  constructor(private router: Router) {}

  modelNumber = +(
    PATH_REGEXP.exec(this.router.url)?.groups?.['modelNumber'] ?? 1
  );
  model = MODELS[this.modelNumber - 1];
}
