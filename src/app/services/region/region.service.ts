import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

import type { Translation } from "../translation/translation.service";
import { ScrollService } from "../scroll/scroll.service";
import { TRANSLATIONS } from "../translation/translation.service";
import { isPlatformBrowser } from "@angular/common";
import { GeolocationService } from "@ng-web-apis/geolocation";
import { take } from "rxjs";

type Region = keyof Translation["region"]["regions"];

const CURRENCIES: { [region in Region]?: string } = {
  gb: "GBP",
  pl: "PLN",
};

const REGION_PRICE_FORMATS = Object.fromEntries(
  Object.keys(TRANSLATIONS.en.region.regions).map((key) => [
    key,
    Intl.NumberFormat(key, {
      style: "currency",
      currency: CURRENCIES[key as Region] ?? "EUR",
    }),
  ]),
) as { [region in Region]: Intl.NumberFormat };

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

  get region() {
    if (!this.isBrowser) return undefined;
    const regionCookie = this.cookieService.get("region");
    if (this.isValidRegion(regionCookie)) {
      return regionCookie;
    }
    return this.suggestedRegion;
  }

  get popupVisible() {
    if (!this.isBrowser) return undefined;
    return this.popupOpen;
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
    if (this.region == null) {
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

  /** Formats the given numeric value as a price according to the selected region.
   * @param value The value to format as a price.
   * @param localise Whether to adjust the price based on region. Defaults to `true`.
   */
  formatPrice(value: number, localise = true) {
    if (isNaN(value)) return "";
    let price = localise ? this.localisePrice(value) : value;
    if (this.region === "pl") {
      // Always localise PLN to account for exchange rate.
      price = this.localisePricePLN(price);
    }
    return REGION_PRICE_FORMATS[this.region ?? "de"].format(price);
  }

  /** Performs adjustments to the price based on region. */
  localisePrice(value: number) {
    switch (this.region) {
      case "sk":
      case "cz":
        return value - 500;
      case "fr":
        return value + 3000;
      default:
        return value;
    }
  }

  /** Applies the exchange rate for EUR to PLN. */
  localisePricePLN(euros: number) {
    return euros * 5;
  }

  getIcon = (region: string) => `fi fi-${region}`;
}
