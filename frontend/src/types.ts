export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  rfid_tag: string;
  has_audio: number;
  available: number;
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
}

export interface Zone {
  id: number;
  name: string;
  detail: string;
}

export interface Reservation {
  id: number;
  status: string;
  reserved_at: string;
  book_id: number;
  title: string;
  author: string;
}

export interface OrderItem {
  qty: number;
  price: number;
  name: string;
}

export interface OrderRecord {
  id: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface User {
  id: number;
  name: string;
  phone: string;
  isAdmin?: boolean;
}

export interface CartLine {
  menuItemId: number;
  name: string;
  price: number;
  qty: number;
}
