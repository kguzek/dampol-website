import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

import type { Translation } from "../translation/translation.service";
import { ScrollService } from "../scroll/scroll.service";
import { TRANSLATIONS } from "../translation/translation.service";
import { isPlatformBrowser } from "@angular/common";
import { GeolocationService } from "@ng-web-apis/geolocation";
import { take } from "rxjs";

type Region = keyof Translation["region"]["regions"];

@Injectable()
export class RegionService {
  private popupOpen = false;
  private isBrowser: boolean;
  private suggestedRegion: Region | null = null;

  constructor(
    private cookieService: CookieService,
    private scrollService: ScrollService,
    private readonly geolocation$: GeolocationService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initialiseRegion();
  }

  private initialiseRegion() {
    if (!this.isBrowser) return;
    const regionCookie = this.cookieService.get("region");
    if (regionCookie === "") {
      this.openPopup();
      this.determineRegion();
      return;
    }
    this.setRegion(regionCookie);
    this.checkPopup();
  }

  private isValidRegion = (region?: string | null): region is Region =>
    region != null && Object.values(TRANSLATIONS).every(({ region: { regions } }) => region in regions);

  private determineRegion() {
    this.geolocation$.pipe(take(1)).subscribe(async (position) => {
      console.log("[RegionService] User geolocation:", position);
      const { latitude, longitude } = position.coords;
      let res;
      try {
        res = await fetch(`https://ctc-api.guzek.uk/${latitude}/${longitude}`);
      } catch (error) {
        console.error("[RegionService] Failed to fetch region:", error);
        return;
      }
      let body: { error: string | null; iso2: string | null; iso3: string | null };
      try {
        body = await res.json();
      } catch (error) {
        console.error("[RegionService] Failed to parse region response:", error);
        return;
      }
      const { error, ...data } = body;
      if (!res.ok) {
        console.error("[RegionService] Non-ok response:", error);
        return;
      }
      const region = data.iso2?.toLowerCase();
      if (this.isValidRegion(region)) {
        console.info("[RegionService] Suggested region:", region);
        this.suggestedRegion = region;
      } else {
        console.log("[RegionService] Unsupported region:", data);
      }
    });
  }

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
