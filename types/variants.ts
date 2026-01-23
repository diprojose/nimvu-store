import { VariantOptions } from "./options";

export type Variants = {
  id: string,
  title: string,
  sku: string,
  barcode: string,
  ean: string,
  upc: string,
  allow_backorder: boolean,
  manage_inventory: boolean,
  hs_code: string,
  origin_country: string,
  mid_code: string,
  material: string,
  weight: string,
  length: string,
  height: string,
  width: string,
  metadata: string,
  variant_rank: number,
  thumbnail: string,
  product_id: string,
  created_at: string,
  updated_at: string,
  deleted_at: string,
  options: VariantOptions[],
  calculated_price: {
    calculated_amount: number;
    original_amount: number;
  }
}