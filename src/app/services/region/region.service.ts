import type { OnInit } from "@angular/core";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

import type { Translation } from "../translation/translation.service";
import { ScrollService } from "../scroll/scroll.service";
import { TRANSLATIONS } from "../translation/translation.service";

type Region = keyof Translation["region"]["regions"];

@Injectable()
export class RegionService implements OnInit {
  private popupOpen = false;

  constructor(
    private cookieService: CookieService,
    private scrollService: ScrollService,
  ) {}

  ngOnInit() {
    this.initialiseRegion();
  }

  private initialiseRegion() {
    const regionCookie = this.cookieService.get("region");
    if (regionCookie === "") {
      this.openPopup();
      return;
    }
    this.setRegion(regionCookie);
    this.closePopup();
  }

  private isValidRegion = (region: string | null): region is Region =>
    region != null && Object.values(TRANSLATIONS).every(({ region: { regions } }) => region in regions);

  get region() {
    const regionCookie = this.cookieService.get("region");
    if (regionCookie === "" || !this.isValidRegion(regionCookie)) {
      return null;
    }
    return regionCookie;
  }

  get popupVisible() {
    if (this.popupOpen) {
      this.scrollService.disableScroll();
    } else {
      this.scrollService.enableScroll();
    }
    return this.popupOpen;
  }

  setRegion(region: string) {
    if (!this.isValidRegion(region)) throw new Error(`Invalid region: ${region}`);
    this.cookieService.set("region", region);
  }

  openPopup() {
    this.popupOpen = true;
  }

  closePopup() {
    this.popupOpen = this.region == null;
  }

  getIcon = (region: string) => `fi fi-${region}`;
}
