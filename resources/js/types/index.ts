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

export type ItemWithRelations = Item & {
  supplier?: Supplier;
  location?: Location;
};

// Usage examples:
// suppliers: Paginated<Supplier>
// locations: Paginated<Location>
// items: Paginated<Item>
// itemsWithRelations: Paginated<ItemWithRelations>