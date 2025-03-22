import { Injectable } from "@angular/core";

import { DIRECTUS_API_URL } from "@/app.constants";

interface DirectusImage {
  directus_files_id: string;
}

export interface Model {
  id: number;
  length: number;
  width: number;
  price_eur: number;
  price_pln: number;
  price_gbp: number | null;
  images: DirectusImage[];
}

async function fetchModels() {}

// const DEFAULT_MODEL: Model = {
//   id: 0,
//   price_eur: 0,
//   price_pln: 0,
//   price_gbp: null,
//   length: 0,
//   width: 0,
//   images: [],
// };

@Injectable()
export class ModelService {
  models: Model[] = [];

  async initialiseModels() {
    const response = await fetch(`${DIRECTUS_API_URL}/items/model?fields=*,images.directus_files_id`);
    const { data } = (await response.json()) as { data: Model[] };
    this.models = data.map((model) => ({ ...model, images: model.images.reverse() }));
  }
}
