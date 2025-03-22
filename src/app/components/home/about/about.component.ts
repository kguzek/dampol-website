import { Component } from "@angular/core";

import type { Media } from "@/components/carousel/carousel.component";
import { TranslationService } from "@/services/translation/translation.service";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"],
  standalone: false,
})
export class AboutComponent {
  protected showcaseMedia: Media[] = [
    { src: "assets/videos/dampol-film.mp4", type: "video/mp4", video: true },
    { src: "assets/images/showcase/truck-in-alps.jpeg", alt: "Dampol truck in the Alps" },
    { src: "assets/images/showcase/container-forklift.jpeg", alt: "Container being placed with forklift" },
    { src: "assets/images/showcase/container-loading.jpeg", alt: "Container being unloaded with crane" },
    { src: "assets/images/showcase/container-loading-snow.jpeg", alt: "Container being unloaded with crane in snow" },
    { src: "assets/images/showcase/container-on-pickup.jpeg", alt: "Container transported on pickup truck" },
    { src: "assets/images/showcase/loading-sideways.jpeg", alt: "Container being unloaded sideways" },
    { src: "assets/images/showcase/truck-blue.jpeg", alt: "Blue Dampol truck with unloaded container" },
    { src: "assets/images/showcase/truck-double.jpeg", alt: "Dampol truck transporting 2 containers" },
    { src: "assets/images/showcase/truck-copenhagen.jpeg", alt: "Empty Dampol truck at Fields, Copenhagen" },
  ];

  constructor(protected translationService: TranslationService) {}
}
