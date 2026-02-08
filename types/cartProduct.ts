import { CartItem } from "./cartItem";

export type CartProduct = {
  id?: string;
  title: string;
  image?: string;
  quantity?: number;
  price?: number;
  items?: CartItem[];
  subtotal: number;
  total: number;
};
