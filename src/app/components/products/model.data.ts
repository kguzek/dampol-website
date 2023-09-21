export const MODELS = [
  { numImages: 2, basePrice: 7999, dimensions: [6, 3] }, // 1
  { numImages: 2, basePrice: 7999, dimensions: [6, 3] }, // 2
  { numImages: 3, basePrice: 8299, dimensions: [6, 3] }, // 3
  { numImages: 3, basePrice: 8399, dimensions: [6, 3] }, // 4
  { numImages: 3, basePrice: 8799, dimensions: [6, 3] }, // 5
  { numImages: 3, basePrice: 9299, dimensions: [7, 3] }, // 6
  { numImages: 4, basePrice: 9499, dimensions: [7, 3] }, // 7
  { numImages: 3, basePrice: 9499, dimensions: [7, 3] }, // 8
  { numImages: 3, basePrice: 10999, dimensions: [7, 3] }, // 9
  { numImages: 3, basePrice: 11999, dimensions: [7, 3] }, // 10
  { numImages: 3, basePrice: 11999, dimensions: [9, 3] }, // 11
  { numImages: 4, basePrice: 12499, dimensions: [7, 3] }, // 12
  { numImages: 2, basePrice: 12500, dimensions: [7, 3] }, // 13
  { numImages: 3, basePrice: 12999, dimensions: [8, 3] }, // 14
  { numImages: 4, basePrice: 24999, dimensions: [8, 6] }, // 15
  { numImages: 3, basePrice: 27999, dimensions: [9, 6] }, // 16
];

export type Model = (typeof MODELS)[number];
