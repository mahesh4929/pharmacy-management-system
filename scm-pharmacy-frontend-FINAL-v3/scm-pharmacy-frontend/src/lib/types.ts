// Types matching the backend DTOs

export interface Stock {
  id: number;
  name: string;
  description: string;
  count: number;
  price: number;
  active?: boolean;
  expiryDate?: string;  // Format: yyyy-MM-dd from backend
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  active?: boolean;
  admin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderedItem {
  id?: number;
  stock_id?: number;
  stock_name?: string;
  stock?: Stock;
  amount: number;
}

export interface Order {
  id: number;
  customer_id: number;
  ordered_items: OrderedItem[];
  date: string;
  invoice?: Invoice;
  paymentMethod?: string;  // "COD" or "ONLINE"
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: number;
  totalPrice: number;
  status: string;
  employee_id?: number;
  order?: Order;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface ApiError {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

export type UserRole = "customer" | "employee" | "admin";

export interface AuthSession {
  token: string;
  username: string;
  userId: number;
  role: UserRole;
}
