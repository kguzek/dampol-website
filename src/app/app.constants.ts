export const DIRECTUS_API_URL = "https://cms.modern-container.com";

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
    airConditioning: [1000, 600],
    toilet: [1200, 650],
    kitchen: [800, 450],
    partitionWall: [{ price: 500, approximate: true } satisfies Price, 200],
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
};
