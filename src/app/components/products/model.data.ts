export const MODELS = [
  { numImages: 5, basePrice: 7399, dimensions: [4, 3] }, // 1, NEW
  { numImages: 4, basePrice: 7899, dimensions: [5, 3] }, // 2, NEW
  { numImages: 2, basePrice: 7999, dimensions: [6, 3] }, // 3
  { numImages: 2, basePrice: 7999, dimensions: [6, 3] }, // 4
  { numImages: 3, basePrice: 8299, dimensions: [6, 3] }, // 5
  { numImages: 3, basePrice: 8299, dimensions: [6, 3] }, // 6, NEW
  { numImages: 3, basePrice: 8399, dimensions: [6, 3] }, // 7
  { numImages: 3, basePrice: 8799, dimensions: [6, 3] }, // 8
  { numImages: 5, basePrice: 9999, dimensions: [6, 3] }, // 9, NEW
  { numImages: 3, basePrice: 9299, dimensions: [7, 3] }, // 10
  { numImages: 4, basePrice: 9499, dimensions: [7, 3] }, // 11
  { numImages: 3, basePrice: 9499, dimensions: [7, 3] }, // 12
  { numImages: 3, basePrice: 10999, dimensions: [7, 3] }, // 13
  { numImages: 3, basePrice: 11999, dimensions: [7, 3] }, // 14
  { numImages: 3, basePrice: 11999, dimensions: [9, 3] }, // 15
  { numImages: 4, basePrice: 12499, dimensions: [7, 3] }, // 16
  { numImages: 2, basePrice: 12500, dimensions: [7, 3] }, // 17
  { numImages: 5, basePrice: 10999, dimensions: [7, 3] }, // 18, NEW
  { numImages: 5, basePrice: 10999, dimensions: [7, 3] }, // 19, NEW
  { numImages: 5, basePrice: 11999, dimensions: [7, 3] }, // 20, NEW
  { numImages: 3, basePrice: 12999, dimensions: [8, 3] }, // 21
  { numImages: 6, basePrice: 14500, dimensions: [8, 3] }, // 22, NEW
  { numImages: 4, basePrice: 24999, dimensions: [8, 6] }, // 23
  { numImages: 3, basePrice: 27999, dimensions: [9, 6] }, // 24
];

export type Model = (typeof MODELS)[number];
