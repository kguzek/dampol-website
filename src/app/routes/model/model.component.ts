import { Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslationService } from "src/app/services/translation/translation.service";
import { LayeredInput } from "../../components/model/input-layered/input-layered.component";
import {
  DEFAULT_PHONE_NUMBER_VALUE,
  PHONE_NUMBER_VALIDATOR,
  PhoneNumber,
} from "../../components/model/input-tel/input-tel.component";
import { MODELS } from "../../components/home/products/model.data";

const DEFAULT_LAYERED_INPUT_VALUE: LayeredInput = {
  base: false,
  extra: false,
  price: { price: 0, approximate: false },
};

const FEATURE_DESCRIPTIONS = {
  airConditioning: "air conditioning",
  toilet: "shower",
  kitchen: "separation wall",
  partitionWall: "internal door",
};

const PATH_REGEXP = /\/model\/(?<modelNumber>\d+)(?:#.+)?/;

const DROPDOWN_VALIDATOR = (control: FormControl) => (+control.value === 0 ? { error: "required" } : null);

interface Window {
  dimensions: number;
  material: "aluminium" | "pcv" | "fixed" | "";
  glazure: "double" | "triple" | "";
}

@Component({
  selector: "app-model",
  templateUrl: "./model.component.html",
  styleUrls: ["./model.component.scss"],
  standalone: false,
})
export class ModelComponent {
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public translationService: TranslationService,
  ) {}

  baseHref = "mailto:dampol.sales@gmail.com";

  modelNumber = +(PATH_REGEXP.exec(this.router.url)?.groups?.["modelNumber"] ?? 1);

  createDoor = (location: number = 0, material: string = "") =>
    this.formBuilder.group({
      location: [location, { validators: [DROPDOWN_VALIDATOR] }],
      material: [material],
    });

  createWindow = (dimensions: number = 0, material: Window["material"] = "", glazure: Window["glazure"] = "") =>
    this.formBuilder.group({
      dimensions: [dimensions, { validators: [DROPDOWN_VALIDATOR] }],
      material: [material],
      glazure: [glazure],
    });

  model = MODELS[this.modelNumber - 1];
  form = this.formBuilder.group({
    dimensions: this.formBuilder.group({
      length: [this.model.dimensions[0]],
      width: [this.model.dimensions[1]],
    }),
    features: this.formBuilder.group({
      airConditioning: [DEFAULT_LAYERED_INPUT_VALUE],
      toilet: [DEFAULT_LAYERED_INPUT_VALUE],
      kitchen: [DEFAULT_LAYERED_INPUT_VALUE],
      partitionWall: [DEFAULT_LAYERED_INPUT_VALUE],
    }),
    specialFeatures: "",
    customerInformation: this.formBuilder.group({
      name: [""],
      phoneNumber: [DEFAULT_PHONE_NUMBER_VALUE, { validators: [PHONE_NUMBER_VALIDATOR] }],
    }),
  });

  /** Returns '?' if the value is `undefined`, else formats it to one decimal place and adds 'm' unit. */
  formatDimension = (value?: number | null) => (value ?? 0).toFixed(1) + " m";

  formatMultiplier(multiplier: number) {
    if (isNaN(multiplier) || multiplier === 1) return "";
    const result = (multiplier - 1) * 100;
    return `${result > 0 ? "+" : ""}${result}%`;
  }

  get totalPrice() {
    let price = this.model.basePrice;
    for (const feature in this.form.value.features) {
      const control = this.form.controls.features.get(feature);
      price += control?.value.price.price;
    }
    return price;
  }

  submit() {
    if (this.form.invalid) {
      try {
        document.getElementById("customise")?.scrollIntoView({ behavior: "smooth" });
      } catch (error) {
        console.warn(
          "Could not scroll up to the form. If you are seeing this message, report it as a bug to @kguzek on GitHub.",
          error,
        );
      }
      this.form.markAllAsTouched();
      return;
    }
    const url = this.getSubmitHref();
    try {
      window.open(this.getSubmitHref(), "_blank");
    } catch (error) {
      console.warn(
        "Could not open the form submission link. If you're using a browser extension that blocks popups, please allow popups for this website. Otherwise, please copy the link below and paste it into your navigation bar.",
        error,
      );
      console.info(url);
    }
  }

  getSubmitHref() {
    const value = this.form.value;
    const orderTimestamp = new Date().toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "long",
    });
    const featureDescriptions: string[] = [];
    for (const [featureName, featureValue] of Object.entries(value.features ?? {})) {
      if (!featureValue?.base) continue;
      const featureKey = featureName as keyof typeof FEATURE_DESCRIPTIONS;
      const featureDetail = FEATURE_DESCRIPTIONS[featureKey].replace(" ", "%20");
      featureDescriptions.push(`${featureName}%20${featureValue.extra ? "with" : "without"}%20${featureDetail}`);
    }
    const encodedSpecialFeatures = encodeURIComponent(value.specialFeatures || "none");
    const encodedName = encodeURIComponent(value.customerInformation?.name || "none");
    const encodedPhoneNumber = encodeURIComponent((value.customerInformation?.phoneNumber as PhoneNumber).value);
    const encodedPrice = encodeURIComponent(this.translationService.formatPrice(this.totalPrice));
    return `${this.baseHref}?subject=Online%20container%20order%20-%20${encodedName}&body=\
Order%20Information%0D%0AModel%20number%3A%20Model%20${this.modelNumber}%0D%0A\
I.%20Dimensions%3A%20${value.dimensions?.length}%20m%20×%20${value.dimensions?.width}%20m%0D%0A\
II.%20Features%3A%20${featureDescriptions.join("%2C%20") || "none"}%0D%0A\
III.%20Special%20features%3A%0D%0A${encodedSpecialFeatures}%0D%0A%0D%0A\
IV.%20Customer%20information%3A%0D%0AName%3A%20${encodedName}%0D%0APhone%20number%3A%20${encodedPhoneNumber}%0D%0A%0D%0A\
Estimated%20price%3A%20${encodedPrice}%0D%0A%0D%0A\
Order%20timestamp%3A%20${orderTimestamp}`;
  }
}
