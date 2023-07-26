import { Component, Input } from '@angular/core';
import { MODELS } from './model/model.data';
import { Translation } from 'src/app/app.translations';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent {
  @Input() translations!: Translation;

  models = MODELS;
}
