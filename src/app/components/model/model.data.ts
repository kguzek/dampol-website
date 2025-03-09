export const MODELS = [
  { numImages: 5, dimensions: [4, 3], price: { eur: 7399, pln: 20900 } }, //   1
  { numImages: 4, dimensions: [5, 3], price: { eur: 7899, pln: 23900 } }, //   2
  { numImages: 2, dimensions: [6, 3], price: { eur: 7999, pln: 24999 } }, //   3
  { numImages: 2, dimensions: [6, 3], price: { eur: 7999, pln: 21900 } }, //   4
  { numImages: 3, dimensions: [6, 3], price: { eur: 8299, pln: 26500 } }, //   5
  { numImages: 3, dimensions: [6, 3], price: { eur: 8299, pln: 25999 } }, //   6
  { numImages: 3, dimensions: [6, 3], price: { eur: 8399, pln: 24999 } }, //   7
  { numImages: 3, dimensions: [6, 3], price: { eur: 8799, pln: 26500 } }, //   8
  { numImages: 5, dimensions: [6, 3], price: { eur: 9999, pln: 27900 } }, //   9
  { numImages: 3, dimensions: [7, 3], price: { eur: 9299, pln: 29999 } }, //  10
  { numImages: 4, dimensions: [7, 3], price: { eur: 9499, pln: 27999 } }, //  11
  { numImages: 3, dimensions: [7, 3], price: { eur: 9499, pln: 27999 } }, //  12
  { numImages: 3, dimensions: [7, 3], price: { eur: 10999, pln: 36499 } }, // 13
  { numImages: 5, dimensions: [7, 3], price: { eur: 11499, pln: 36499 } }, // 14
  { numImages: 5, dimensions: [7, 3], price: { eur: 10999, pln: 37900 } }, // 15
  { numImages: 5, dimensions: [7, 3], price: { eur: 11999, pln: 37900 } }, // 16
  { numImages: 3, dimensions: [7, 3], price: { eur: 11999, pln: 37900 } }, // 17
  { numImages: 4, dimensions: [7, 3], price: { eur: 12499, pln: 37900 } }, // 18
  { numImages: 2, dimensions: [7, 3], price: { eur: 12500, pln: 37900 } }, // 19
  { numImages: 3, dimensions: [8, 3], price: { eur: 12999, pln: 44599 } }, // 20
  { numImages: 6, dimensions: [8, 3], price: { eur: 14500, pln: 48900 } }, // 21
  { numImages: 4, dimensions: [8, 6], price: { eur: 24999, pln: 89900 } }, // 22
  { numImages: 3, dimensions: [9, 3], price: { eur: 11999, pln: 39900 } }, // 23
  { numImages: 3, dimensions: [9, 6], price: { eur: 27999, pln: 94999 } }, // 24
];

export type Model = (typeof MODELS)[number];
