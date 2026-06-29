import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ScrollService {
  private renderer: Renderer2;
  private scrollPosition = 0;
  private scrollEnabled = true;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  disableScroll() {
    if (!this.scrollEnabled) return;
    try {
      this.scrollPosition = window.scrollY;
      this.renderer.setStyle(document.body, "overflow-y", "hidden");
      this.renderer.setStyle(document.body, "position", "fixed");
      this.renderer.setStyle(document.body, "top", `-${this.scrollPosition}px`);
      this.renderer.setStyle(document.body, "width", "100%");
      this.scrollEnabled = false;
    } catch {}
  }

  enableScroll() {
    if (this.scrollEnabled) return;
    try {
      this.renderer.removeStyle(document.body, "overflow-y");
      this.renderer.removeStyle(document.body, "position");
      this.renderer.removeStyle(document.body, "top");
      this.renderer.removeStyle(document.body, "width");
      window.scrollTo(0, this.scrollPosition);
      this.scrollEnabled = true;
    } catch {}
  }
}
