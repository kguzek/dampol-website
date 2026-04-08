import { Component } from "@angular/core";
import { FormBuilder, FormControl } from "@angular/forms";
import { Router } from "@angular/router";

import type { FeatureKey } from "@/app.constants";
import type { Model } from "@/services/model/model.service";
import { MODEL_COMPONENT_PRICES } from "@/app.constants";
import { FeatureInput } from "@/components/model/input-feature/input-feature.component";
import { LayeredInput } from "@/components/model/input-layered/input-layered.component";
import {
  DEFAULT_PHONE_NUMBER_VALUE,
  PHONE_NUMBER_VALIDATOR,
  PhoneNumber,
} from "@/components/model/input-tel/input-tel.component";
import { ModelService } from "@/services/model/model.service";
import { PlatformService } from "@/services/platform/platform.service";
import { RegionService } from "@/services/region/region.service";
import { TRANSLATIONS, TranslationService } from "@/services/translation/translation.service";

const DEFAULT_LAYERED_INPUT_VALUE: LayeredInput = {
  base: false,
  extra: false,
  price: { price: 0, approximate: false },
};

const DEFAULT_FEATURE_INPUT_VALUE: FeatureInput = {
  selected: false,
  price: { price: 0, approximate: false },
};

const LAYERED_FEATURES: FeatureKey[] = [
  "airConditioning",
  "toilet",
  "kitchenStandard",
  "kitchenLuxury",
  "partitionWall",
  "doubleDoor",
];

const SINGLE_FEATURES: FeatureKey[] = [
  "externalShutters",
  "pirInsulation",
  "stainlessSteelHandle",
  "softClose",
  "externalLedLamp",
  "extraSocket",
];

const FEATURE_DESCRIPTIONS: Record<FeatureKey, string> = {
  airConditioning: "large variant",
  toilet: "shower",
  kitchenStandard: "separation wall",
  kitchenLuxury: "separation wall",
  partitionWall: "internal door",
  doubleDoor: "tinted glass",
  externalShutters: "external shutters",
  pirInsulation: "PIR insulation",
  stainlessSteelHandle: "stainless steel handle",
  softClose: "soft close",
  externalLedLamp: "external LED lamp",
  extraSocket: "extra socket",
};

const FEATURE_LABELS: Record<FeatureKey, string> = {
  airConditioning: "Air conditioning",
  toilet: "Toilet",
  kitchenStandard: "Standard kitchen annexe",
  kitchenLuxury: "Luxury kitchen annexe",
  partitionWall: "Partition wall",
  doubleDoor: "Double door",
  externalShutters: "External shutters",
  pirInsulation: "PIR insulation",
  stainlessSteelHandle: "Stainless steel handle",
  softClose: "Soft close",
  externalLedLamp: "External LED lamp",
  extraSocket: "Extra socket",
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
    protected translationService: TranslationService,
    protected regionService: RegionService,
    private platformService: PlatformService,
    modelService: ModelService,
  ) {
    this.model = modelService.modelsById[this.modelNumber];
    this.form = this.formBuilder.group({
      dimensions: this.formBuilder.group({
        length: [this.model.length],
        width: [this.model.width],
      }),
      features: this.formBuilder.group({
        ...Object.fromEntries(LAYERED_FEATURES.map((feature) => [feature, [DEFAULT_LAYERED_INPUT_VALUE]])),
        ...Object.fromEntries(SINGLE_FEATURES.map((feature) => [feature, [DEFAULT_FEATURE_INPUT_VALUE]])),
      }),
      specialFeatures: "",
      customerInformation: this.formBuilder.group({
        name: [""],
        phoneNumber: [DEFAULT_PHONE_NUMBER_VALUE, { validators: [PHONE_NUMBER_VALIDATOR] }],
      }),
    });
  }

  getModelNumber() {
    const match = PATH_REGEXP.exec(this.router.url);
    if (match?.groups == null) {
      throw new Error(`Model number not found in URL: ${this.router.url}`);
    }
    const modelNumber = match.groups["modelNumber"];
    if (isNaN(+modelNumber)) {
      throw new Error(`Model number is not a number: ${modelNumber}`);
    }
    return +modelNumber;
  }

  baseHref = "mailto:dampol.sales@gmail.com";
  modelNumber = this.getModelNumber();
  model: Model;
  form;

  layeredFeatures = LAYERED_FEATURES;
  singleFeatures = SINGLE_FEATURES;

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

  /** Returns '?' if the value is `undefined`, else formats it to one decimal place and adds 'm' unit. */
  formatDimension = (value?: number | null) => (value ?? 0).toFixed(1) + " m";

  /** Preserves the original order of keys when using the keyvalue pipe. */
  preserveOrder = () => 0;

  formatMultiplier(multiplier: number) {
    if (isNaN(multiplier) || multiplier === 1) return "";
    const result = (multiplier - 1) * 100;
    return `${result > 0 ? "+" : ""}${result}%`;
  }

  get totalPrice() {
    let price = this.regionService.localisePrice(this.model);
    for (const feature in this.form.value.features) {
      const control = this.form.controls.features.get(feature);
      price += control?.value.price.price;
    }
    return price;
  }

  submit() {
    if (this.platformService.isServer) {
      return;
    }
    if (this.form.invalid) {
      document.getElementById("customise")?.scrollIntoView({ behavior: "smooth" });
      this.form.markAllAsTouched();
      return;
    }
    const url = this.getSubmitHref();
    try {
      window.open(this.getSubmitHref(), "_blank");
    } catch (error) {
      console.error(
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

    const featureDescriptions = Object.entries(value.features ?? {})
      .map(([featureName, featureValue]) => {
        const featureKey = featureName as FeatureKey;

        if (LAYERED_FEATURES.includes(featureKey)) {
          const layeredValue = featureValue as LayeredInput;
          if (layeredValue?.base) {
            const extraText = layeredValue.extra ? "with" : "without";
            return `${FEATURE_LABELS[featureKey]} ${extraText} ${FEATURE_DESCRIPTIONS[featureKey]}`;
          }
        } else if (SINGLE_FEATURES.includes(featureKey)) {
          const singleValue = featureValue as FeatureInput;
          if (singleValue?.selected) {
            return FEATURE_DESCRIPTIONS[featureKey];
          }
        }
        return null;
      })
      .filter((desc): desc is string => desc !== null);

    const name = value.customerInformation?.name || "none";
    const phoneNumber = (value.customerInformation?.phoneNumber as PhoneNumber).value;
    const region = this.regionService.region
      ? TRANSLATIONS.en.region.regions[this.regionService.region]
      : "unknown region";
    const language = TRANSLATIONS[this.translationService.translations.code].language;

    const bodyLines = [
      "Order Information",
      `Model number: Model ${this.modelNumber}`,
      "",
      `I. Dimensions: ${value.dimensions?.length} m × ${value.dimensions?.width} m`,
      `II. Features: ${featureDescriptions.join(", ") || "none"}`,
      "III. Special features:",
      value.specialFeatures || "none",
      "",
      "IV. Customer information:",
      `Name: ${name}`,
      `Phone number: ${phoneNumber}`,
      `Language: ${language}`,
      `Delivery region: ${region}`,
      "",
      `Estimated price: ${this.regionService.formatPrice(this.totalPrice)}`,
      "",
      `Order timestamp: ${orderTimestamp}`,
    ];

    const params = new URLSearchParams({
      subject: `Online container order - ${name}`,
      body: bodyLines.join("\r\n"),
    });

    return `${this.baseHref}?${params.toString()}`;
  }
}
