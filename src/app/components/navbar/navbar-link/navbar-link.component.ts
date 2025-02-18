import { Component, Input } from "@angular/core";

@Component({
  selector: "app-navbar-link",
  templateUrl: "./navbar-link.component.html",
  styleUrls: ["./navbar-link.component.scss"],
  standalone: false,
})
export class NavbarLinkComponent {
  @Input() link!: string;
  @Input() label!: string;
  @Input() isButton?: boolean = false;
}
