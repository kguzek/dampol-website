import { isPlatformBrowser } from "@angular/common";
import { Injectable } from "@angular/core";
import { GeolocationService } from "@ng-web-apis/geolocation";
import { CookieService } from "ngx-cookie-service";
import { take } from "rxjs";

import type { Model } from "@/components/model/model.data";

import type { Translation } from "../translation/translation.service";
import { PlatformService } from "../platform/platform.service";
import { ScrollService } from "../scroll/scroll.service";
import { TRANSLATIONS } from "../translation/translation.service";

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
  private suggestedRegion: Region | null = null;

  constructor(
    private cookieService: CookieService,
    private scrollService: ScrollService,
    private platformService: PlatformService,
    private readonly geolocation$: GeolocationService,
  ) {
    this.initialiseRegion();
  }

  private initialiseRegion() {
    if (this.platformService.isServer) return;
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
    if (this.platformService.isServer) return undefined;
    const regionCookie = this.cookieService.get("region");
    if (this.isValidRegion(regionCookie)) {
      return regionCookie;
    }
    return this.suggestedRegion;
  }

  get popupVisible() {
    if (this.platformService.isServer) return undefined;
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

  private extractPrice(value: number | Model) {
    if (typeof value === "number") {
      return value;
    }
    return this.region === "pl" ? (value.price.pln ?? this.localisePricePLN(value.price.eur)) : value.price.eur;
  }

  /** Formats the given numeric value as a price according to the selected region.
   * @param value The value to format as a price.
   * @param localise Whether to adjust the price based on region. Defaults to `true`.
   */
  formatPrice(value: number | Model, localise = true) {
    if (typeof value === "number" && isNaN(value)) return "";
    const price = localise ? this.localisePrice(value) : this.extractPrice(value);
    return REGION_PRICE_FORMATS[this.region ?? "de"].format(price);
  }

  /** Performs adjustments to the price based on region. */
  localisePrice(value: number | Model) {
    const price = this.extractPrice(value);
    switch (this.region) {
      case "sk":
      case "cz":
        return price - 500;
      case "fr":
        return price + 3000;
      default:
        return price;
    }
  }

  /** Conditionally applies the exchange rate for EUR to PLN. Used for flat-rate feature prices. */
  localisePricePLN = (euros: number) => (this.region === "pl" ? euros * 3 : euros);

  getIcon = (region: string) => `fi fi-${region}`;
}
