import { Component, Input } from "@angular/core";

@Component({
  selector: "app-navbar-link",
  templateUrl: "./navbar-link.component.html",
  styleUrls: ["./navbar-link.component.scss"],
  standalone: false,
})
export class NavbarLinkComponent {
  @Input({ required: true }) link!: string;
  @Input({ required: true }) label!: string;
  @Input({ required: true }) isButton?: boolean = false;
}
