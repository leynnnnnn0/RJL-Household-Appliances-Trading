import { AvatarFallbackProps } from "@radix-ui/react-avatar";

export interface Paginated<T> {
  data: T[];
  links: PaginationLink[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export type Supplier = {
  id: number;
  slug: string;
  name: string;
  remarks: string | null;
};

export type Location = {
  id: number;
  name: string;
  address: string;
  remarks: string | null;
};

export type Item = {
  id: number;
  supplier: string;
  location_id: number | null;
  item_type: string;
  dr_no: string | null;
  description: string;
  model: string | null;
  serial: string | null;
  quantity: number;
  srp: number;
  unit_cost: number;
  date_of_purchase: string;
  date_out: string | null;
  size: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: number;
  avatar: string | undefined;
  full_name : string | null;
  first_name: string;
  last_name: string;
  email: string;
}

export type Customer = {
  id: number | string;
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string
}

export type CustomerReference = {
  id: number | string,
  full_name: string,
  phone_number: string
};

export type InvenstigationDetail = {
  id: number | string;
  employee_id: number | string;
  home_visit_date: string;
  is_employment_verified: boolean;
  investigation_notes: string;
}

export type CustomerWithRelation = Customer & {
  reference: CustomerReference;
  investigation_detail: InvenstigationDetail

}

export type ItemWithRelations = Item & {
  supplier?: Supplier;
  location?: Location;
};

export type Order = {
  id: number;
  location_id: number;
  employee_id: number;
  order_number: string;
  total_price: number;
  transaction_date: string;
  reason_for_cancellation: string;
  is_void: boolean;
  void_date: string;
  user_id: number;
  payment_method: string;
  reference_number: string | null;
}

export type Orderitem = {
  order_id: number;
  item_id: number;
  serial: string;
  sale_amount: number;
  discount_amount: number;
}

export type OrderWithrelations = Order & {
  order_items: OrderItemWithRelations[],
  location: Location,
  employee: User
  customer: Customer
}

export type OrderItemWithRelations = Orderitem & {
  item: Item
}

// Usage examples:
// suppliers: Paginated<Supplier>
// locations: Paginated<Location>
// items: Paginated<Item>
// itemsWithRelations: Paginated<ItemWithRelations>