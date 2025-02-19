import type { OnInit } from "@angular/core";
import { Injectable } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

import type { Translation } from "../translation/translation.service";
import { ScrollService } from "../scroll/scroll.service";
import { TRANSLATIONS } from "../translation/translation.service";

type Region = keyof Translation["region"]["regions"];

@Injectable()
export class RegionService implements OnInit {
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
      return;
    }
    this.setRegion(regionCookie);
    this.popupOpen = this.shouldShowPopup();
  }

  private isValidRegion = (region: string | null): region is Region =>
    region != null && Object.values(TRANSLATIONS).every(({ region: { regions } }) => region in regions);

  get region() {
    return this._region;
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
    this._region = region;
    this.cookieService.set("region", region);
  }

  openPopup() {
    this.popupOpen = true;
  }

  closePopup() {
    this.popupOpen = this.shouldShowPopup();
  }

  getIcon = (region: string) => `fi fi-${region}`;

  shouldShowPopup = () => !this.isValidRegion(this._region);

  private _region: Region | null = null;
  private popupOpen = false;
}
