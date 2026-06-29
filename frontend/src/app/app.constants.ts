export const DIRECTUS_API_URL = "https://cms.modern-container.com";
export const LOGO_URL_BLACK = `${DIRECTUS_API_URL}/assets/f4a21138-db6a-4caa-85a1-6bb6b441933c`;
export const LOGO_URL_WHITE = `${DIRECTUS_API_URL}/assets/5defaec4-0762-4892-a7fe-0e05422f05f0`;

export const LARGE_SCREEN_SIZE_PX = 1600;
export const MEDIUM_SCREEN_SIZE_PX = 1140;
export const SMALL_SCREEN_SIZE_PX = 860;
export const TINY_SCREEN_SIZE_PX = 500;

export const DOOR_LOCATIONS = ["Front", "Rear", "Left", "Right"];

export interface Price {
  price: number;
  approximate: boolean;
}

export const MODEL_COMPONENT_PRICES = {
  dimensions: {
    widthUnitPrice: 500,
    lengthUnitPrice: 1000,
    lengthCutoff: 6,
    lengthMultiplierUnderCutoff: 0.5,
    additionalContainerWidthPrice: 2500,
  },
  features: {
    airConditioning: [1100, 600],
    toilet: [1500, 1000],
    kitchenStandard: [950, 450],
    kitchenLuxury: [2300, 450],
    partitionWall: [{ price: 650, approximate: true } satisfies Price, 100],
    doubleDoor: [600, 300],
    externalShutters: [400],
    pirInsulation: [{ price: 600, approximate: true } satisfies Price],
    stainlessSteelHandle: [300],
    softClose: [200],
    externalLedLamp: [150],
    extraSocket: [100],
  },
  doors: {
    aluminium: 900,
    aluminiumGlass: 700,
    aluminiumDouble: 1200,
    steel: 500,
  },
  windows: {
    dimensionPrices: [150, 250, 350, 500, 500, 1000],
    materialMultipliers: {
      pcv: 1,
      aluminium: 1.5,
      fixed: 0.5,
    },
    tripleGlazedMultiplier: 1, //TODO: Update
  },
} as const;

export type FeatureKey = keyof typeof MODEL_COMPONENT_PRICES.features;
