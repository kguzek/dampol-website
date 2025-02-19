import type { OnInit } from "@angular/core";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

import type { Translation } from "../translation/translation.service";
import { ScrollService } from "../scroll/scroll.service";
import { TRANSLATIONS } from "../translation/translation.service";
import { isPlatformBrowser } from "@angular/common";

type Region = keyof Translation["region"]["regions"];

@Injectable()
export class RegionService implements OnInit {
  private popupOpen = false;
  private isBrowser: boolean;
  private suggestedRegion: Region | null = null;

  constructor(
    private cookieService: CookieService,
    private scrollService: ScrollService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initialiseRegion();
  }

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
    this.checkPopup();
  }

  private isValidRegion = (region: string | null): region is Region =>
    region != null && Object.values(TRANSLATIONS).every(({ region: { regions } }) => region in regions);

  private getRegion() {
    if (!this.isBrowser) return undefined;
    const regionCookie = this.cookieService.get("region");
    if (this.isValidRegion(regionCookie)) {
      return regionCookie;
    }
    return null;
  }

  /** `undefined` if accessed on the server and `null` if the cookie isn't set. */
  get region() {
    return this.getRegion() ?? this.suggestedRegion;
  }

  get popupVisible() {
    if (!this.isBrowser) return undefined;
    return this.popupOpen;
  }

  get isRegionNull() {
    return this.region == null;
  }

  setRegion(region: string) {
    if (!this.isValidRegion(region)) throw new Error(`Invalid region: ${region}`);
    this.cookieService.set("region", region, { path: "/", expires: 365 });
  }

  openPopup() {
    this.popupOpen = true;
    this.scrollService.disableScroll();
  }

  /** Closes the popup if a valid region is set.
   * @returns true if the popup was closed otherwise false */
  closePopup() {
    if (this.getRegion() == null) {
      return false;
    }
    this.popupOpen = false;
    this.scrollService.enableScroll();
    if (this.suggestedRegion != null) {
      this.setRegion(this.suggestedRegion);
      this.suggestedRegion = null;
    }
    return true;
  }

  /** Checks if the set region is valid. If so, closes the popop (if open), otherwise opens the popup (if closed). */
  checkPopup() {
    if (!this.closePopup()) {
      this.openPopup();
    }
  }

  getIcon = (region: string) => `fi fi-${region}`;
}
