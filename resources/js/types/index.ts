import posInstallmentOrders from "@/routes/pos-installment-orders";
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


export type Employee = {
  id: number;
  avatar: string | undefined;
  full_name : string | null;
  first_name: string;
  last_name: string;
}
export type Customer = {
  id: number | string;
  first_name: string;
  last_name: string;
  address: string;
  phone_number: string;
  full_name: string;
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
  customer_reference: CustomerReference;
  investigation_detail: InvenstigationDetail
  orders: OrderWithrelations[],
  installment_orders: InstallmentOrderWithRelations[]
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

export type InstallmentOrder = {
  id: number | string;
  customer_id: number | null;
  location_id: number | null;
  user_id: number | null;
  order_number: string;
  loan_contract_price: number;
  lcp_markup_rate: number;
  lcp_additional_charge: number;
  down_payment: number;
  payment_method: string | null;
  reference_number: string | null;
  promisory_note_value: number;
  number_of_terms: number;
  promisory_note_value_interest: number;
  promisory_note_value_interest_additional_charge: number;
  transaction_date: string; // ISO date string, e.g. "2025-10-31"
  is_voided: boolean;
  reason_for_cancellation: string | null;
  void_date: string | null; // or Date if you parse it
  is_completed: boolean;
  is_defaulted: boolean;
  default_reason: string | null;
  total_rebate_amount: number;
  total_amount_paid: number | 0;
  remaining_balance: number | 0;

  is_accelerated: boolean,
  reason_for_acceleration: string | null;
  acceleration_discount: number; 
  acceleration_date: string;

}

export type InstallmentOrderItem = {
   installment_order_id: number;
   item_id: number;
   serial: string;
   sale_amount: number;
   discount_amount: number;
   item: Item
}

export type InstallmentOrderWithRelations = InstallmentOrder & {
  customer: Customer;
  location: Location;
  user: User;
  voider: User;
  installment_order_item: InstallmentOrderItem;
  installment_order_payments: InstallmentOrderPayment[]
}

export type InstallmentOrderPayment = {
  id: number | string;
  installment_order_id: number | string;
  installment_number: number;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  payment_method: string | null;
  reference_number: string | null;
  status: string;
  paid_date: string;
  rebate_amount: number;
  rebate_reason: string | null;
  installment_order_payment_history: null | InstallmentOrderPaymentHistory[]
};

export type Children = {
  children: React.ReactNode
}

export type InstallmentOrderPaymentHistory = {
    id: number | string;
    payment_id: number | string;
    amount: number ;
    payment_method: number,
    reference_number: string | null,
    paid_date: string;
    collection_receipt_number: string
    user: User;

};


export type User = {
  id: number;
  avatar: string | undefined;
  full_name : string | null;
  first_name: string;
  last_name: string;
  email: string;
}

export type ExpenseRecord = {
  id: number | string;
  user_id: number | string;
  amount: number;
  category: string;
  status: string;
  remarks: string;
  approved_by: User | null;
  approved_at: string | null;
  payment_method: string;
  reference_number: string;
  receipt_path: string;
  user?: User; 
  created_at: string; 
  updated_at: string;
}
// Usage examples:
// suppliers: Paginated<Supplier>
// locations: Paginated<Location>
// items: Paginated<Item>
// itemsWithRelations: Paginated<ItemWithRelations>