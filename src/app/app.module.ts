import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { NavbarLinkComponent } from './components/navbar/navbar-link/navbar-link.component';
import { AboutComponent } from './components/about/about.component';

@NgModule({
  declarations: [AppComponent, NavbarComponent, NavbarLinkComponent, AboutComponent],
  imports: [BrowserModule, AppRoutingModule, MatIconModule],
  exports: [MatIconModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
