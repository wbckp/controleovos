
export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING'
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  quantity: number; // in dozens
  value: number;
  date: string;
  paymentDate?: string;
  status: PaymentStatus;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string;
  avatarUrl?: string;
  initials?: string;
}

export enum AppScreen {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CLIENT_LIST = 'CLIENT_LIST',
  CLIENT_DETAIL = 'CLIENT_DETAIL',
  NEW_SALE = 'NEW_SALE',
  EDIT_SALE = 'EDIT_SALE',
  EDIT_CLIENT = 'EDIT_CLIENT',
  NEW_CLIENT = 'NEW_CLIENT',
  FINANCES = 'FINANCES',
  SETTINGS = 'SETTINGS',
  REPORTS = 'REPORTS'
}

export interface AppSettings {
  appName: string;
  appLogo: string;
}

export interface AppState {
  currentScreen: AppScreen;
  selectedCustomerId?: string;
  isLoggedIn: boolean;
}
