export type Category = {
  slug: string;
  name: string;
};

export type Location = {
  id: number;
  name: string;
};

export type Item = {
  id: number;
  category: string;
  location_id: number | null;
  dr_no: string | null;
  supplier: string | null;
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
  category?: Category;
  location?: Location;
};