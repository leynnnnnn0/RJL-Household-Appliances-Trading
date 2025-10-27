export type Supplier = {
  slug: string;
  name: string;
};

export type Location = {
  id: number;
  name: string;
  adderess: string;
  remarks: string | null;
};

export type Item = {
  id: number;
  supplier: string;
  location_id: number | null;
  item_type: string;
  dr_no: string | null;r
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