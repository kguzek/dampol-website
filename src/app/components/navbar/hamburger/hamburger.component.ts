import { Component, Input } from "@angular/core";

@Component({
  selector: "app-hamburger",
  templateUrl: "./hamburger.component.html",
  styleUrl: "./hamburger.component.scss",
  standalone: false,
})
export class HamburgerComponent {
  @Input({ required: true }) isMenuOpen!: boolean;
  @Input({ required: true }) isDark!: boolean;
}
