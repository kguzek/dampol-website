import { NgModule } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NavbarLinkComponent } from './components/navbar/navbar-link/navbar-link.component';
import { AboutComponent } from './components/about/about.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { ProductsComponent } from './components/products/products.component';
import { ModelComponent } from './components/products/model/model.component';
import { ContactComponent } from './components/contact/contact.component';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    NavbarLinkComponent,
    AboutComponent,
    ScrollToTopComponent,
    ProductsComponent,
    ModelComponent,
    ContactComponent,
    HeaderComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, MatIconModule, HttpClientModule],
  exports: [MatIconModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    // Add Instagram mat-icon svg
    const url = 'assets/images/instagram.svg';
    this.matIconRegistry.addSvgIcon(
      'instagram',
      this.domSanitizer.bypassSecurityTrustResourceUrl(url)
    );
  }
}
