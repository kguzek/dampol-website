import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MODELS } from './components/products/model/model.data';

const routes: Routes = [
  { path: 'about', component: AppComponent },
  { path: 'contact', component: AppComponent },
  { path: 'products', component: AppComponent },
  ...Array(MODELS.length)
    .fill(1)
    .map((start, idx) => ({
      path: `products/${start + idx}`,
      component: AppComponent,
    })),
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
