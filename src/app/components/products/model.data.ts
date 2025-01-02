export const MODELS = [
  { numImages: 5, basePrice: 7399, dimensions: [4, 3] }, // 1
  { numImages: 4, basePrice: 7899, dimensions: [5, 3] }, // 2
  { numImages: 2, basePrice: 7999, dimensions: [6, 3] }, // 3
  { numImages: 2, basePrice: 7999, dimensions: [6, 3] }, // 4
  { numImages: 3, basePrice: 8299, dimensions: [6, 3] }, // 5
  { numImages: 3, basePrice: 8299, dimensions: [6, 3] }, // 6
  { numImages: 3, basePrice: 8399, dimensions: [6, 3] }, // 7
  { numImages: 3, basePrice: 8799, dimensions: [6, 3] }, // 8
  { numImages: 5, basePrice: 9999, dimensions: [6, 3] }, // 9
  { numImages: 3, basePrice: 9299, dimensions: [7, 3] }, // 10
  { numImages: 4, basePrice: 9499, dimensions: [7, 3] }, // 11
  { numImages: 3, basePrice: 9499, dimensions: [7, 3] }, // 12
  { numImages: 3, basePrice: 10999, dimensions: [7, 3] }, // 13
  { numImages: 5, basePrice: 10999, dimensions: [7, 3] }, // 18 -> 14
  { numImages: 5, basePrice: 10999, dimensions: [7, 3] }, // 19 -> 15
  { numImages: 5, basePrice: 11999, dimensions: [7, 3] }, // 20 -> 16
  { numImages: 3, basePrice: 11999, dimensions: [7, 3] }, // 14 -> 17
  { numImages: 4, basePrice: 12499, dimensions: [7, 3] }, // 16 -> 18
  { numImages: 2, basePrice: 12500, dimensions: [7, 3] }, // 17 -> 19
  { numImages: 3, basePrice: 12999, dimensions: [8, 3] }, // 21 -> 20
  { numImages: 6, basePrice: 14500, dimensions: [8, 3] }, // 22 -> 21
  { numImages: 4, basePrice: 24999, dimensions: [8, 6] }, // 23 -> 22
  { numImages: 3, basePrice: 11999, dimensions: [9, 3] }, // 15 -> 23
  { numImages: 3, basePrice: 27999, dimensions: [9, 6] }, // 24
];

export type Model = (typeof MODELS)[number];
