import { OptionsValues, VariantOptionsValues } from "./optionValues";

export type Options = {
  id: string;
  title: string;
  metadata: string;
  product_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  values: OptionsValues[]
}

export type VariantOptions = {
  "id": string;
  "value": string;
  "metadata": string;
  "option_id": string;
  "option": VariantOptionsValues;
  "created_at": string;
  "updated_at": string;
  "deleted_at": string;
}