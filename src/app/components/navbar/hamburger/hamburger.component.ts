import { Component, Input } from "@angular/core";

@Component({
  selector: "app-hamburger",
  templateUrl: "./hamburger.component.html",
  styleUrl: "./hamburger.component.scss",
  standalone: false,
})
export class HamburgerComponent {
  @Input() isMenuOpen!: boolean;
  @Input() isDark!: boolean;
}
