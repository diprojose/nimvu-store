import { Address } from "./address";

export interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  companyName?: string;
  isB2BApproved?: boolean;
  addresses: Partial<Address>[];
}
