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

  midpoint = MODELS.length / 2;

  models = [MODELS.slice(0, this.midpoint), MODELS.slice(this.midpoint)];
}
