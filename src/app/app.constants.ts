export const LARGE_SCREEN_SIZE_PX = 1600;
export const MEDIUM_SCREEN_SIZE_PX = 1140;
export const SMALL_SCREEN_SIZE_PX = 860;
export const TINY_SCREEN_SIZE_PX = 500;

export interface Price {
  price: number;
  approximate: boolean;
}

export const MODEL_COMPONENT_PRICES = {
  toilet: [1000, 600],
  kitchen: [750, 450],
  partitionWall: [{ price: 300, approximate: true } as Price, 200],
};
