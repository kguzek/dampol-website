import { provideHttpClient, withFetch, withInterceptorsFromDi } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { BrowserModule, DomSanitizer, provideClientHydration, withEventReplay } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AboutComponent } from "./components/home/about/about.component";
import { FooterComponent } from "./components/home/footer/footer.component";
import { HeaderComponent } from "./components/home/landing-page/landing-page.component";
import { ProductsComponent } from "./components/home/products/products.component";
import { InputLayeredComponent } from "./components/model/input-layered/input-layered.component";
import { InputTelComponent } from "./components/model/input-tel/input-tel.component";
import { ModelPreviewComponent } from "./components/model/model-preview/model-preview.component";
import { HamburgerComponent } from "./components/navbar/hamburger/hamburger.component";
import { LanguageSelectComponent } from "./components/navbar/language-select/language-select.component";
import { NavbarLinkComponent } from "./components/navbar/navbar-link/navbar-link.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { RegionPopupComponent } from "./components/region/region-popup/region-popup.component";
import { RegionSelectComponent } from "./components/region/region-select/region-select.component";
import { ScrollToTopComponent } from "./components/scroll-to-top/scroll-to-top.component";
import { HomeComponent } from "./routes/home/home.component";
import { ModelComponent } from "./routes/model/model.component";
import { NotFoundComponent } from "./routes/not-found/not-found.component";
import { PlatformService } from "./services/platform/platform.service";
import { RegionService } from "./services/region/region.service";
import { ScrollService } from "./services/scroll/scroll.service";
import { TranslationService } from "./services/translation/translation.service";

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
    FooterComponent,
    HeaderComponent,
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
    LanguageSelectComponent,
    RegionPopupComponent,
    RegionSelectComponent,
  ],
  providers: [
    PlatformService,
    TranslationService,
    RegionService,
    ScrollService,
    FormBuilder,
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    provideClientHydration(withEventReplay()),
  ],
})
export class AppModule {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    // Add Instagram mat-icon svg
    const url = "assets/images/instagram.svg";
    this.matIconRegistry.addSvgIcon("instagram", this.domSanitizer.bypassSecurityTrustResourceUrl(url));
  }
}
