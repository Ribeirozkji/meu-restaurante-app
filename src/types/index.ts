export type CategoryId =
  | "cafe-da-manha"
  | "lanches"
  | "almoco"
  | "jantar"
  | "bebidas"
  | "sobremesas"
  | "promocoes";

export interface Category {
  id: CategoryId;
  name: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  category: CategoryId;
  rating: number;
  available: boolean;
  image: string;
  addons: Addon[];
  sales: number;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
}

export type StockStatus = "normal" | "baixo" | "critico" | "esgotado";

export interface Address {
  id: string;
  label: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  reference: string;
  isPrimary: boolean;
  distanceKm: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  district: string;
  address: string;
  cep: string;
  city: string;
  createdAt: string;
}

export type PaymentMethod = "pix" | "dinheiro" | "cartao";

export type OrderStatus =
  | "novo"
  | "preparacao"
  | "entrega"
  | "entregue"
  | "cancelado";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  addons?: string[];
  note?: string;
}

export interface Order {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  district: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  payment: PaymentMethod;
  paid: boolean;
  status: OrderStatus;
  createdAt: string;
  distanceKm: number;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  addons: Addon[];
  note: string;
}

export interface DailyClosing {
  date: string;
  orders: number;
  revenue: number;
  averageTicket: number;
}
