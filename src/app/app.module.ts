import { NgModule } from '@angular/core';
import {
  BrowserModule,
  DomSanitizer,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NavbarLinkComponent } from './components/navbar/navbar-link/navbar-link.component';
import { HamburgerComponent } from './components/navbar/hamburger/hamburger.component';
import { AboutComponent } from './components/about/about.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { ProductsComponent } from './components/products/products.component';
import { ModelPreviewComponent } from './components/products/model-preview/model-preview.component';
import { ModelComponent } from './components/model/model.component';
import { ContactComponent } from './components/contact/contact.component';
import { HeaderComponent } from './components/landing-page/landing-page.component';
import { LanguageSelectComponent } from './components/navbar/language-select/language-select.component';
import { HomeComponent } from './components/home/home.component';
import { TranslationService } from './translation.service';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { InputLayeredComponent } from './components/model/input-layered/input-layered.component';
import { InputTelComponent } from './components/input-tel/input-tel.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    NavbarLinkComponent,
    HamburgerComponent,
    AboutComponent,
    ScrollToTopComponent,
    ProductsComponent,
    ModelPreviewComponent,
    ModelComponent,
    ContactComponent,
    HeaderComponent,
    LanguageSelectComponent,
    HomeComponent,
    NotFoundComponent,
    InputLayeredComponent,
    InputTelComponent,
  ],
  exports: [MatIconModule],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    TranslationService,
    FormBuilder,
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideClientHydration(withEventReplay()),
  ],
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
