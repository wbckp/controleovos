
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
  REPORTS = 'REPORTS',
  ACTIVITY_LOGS = 'ACTIVITY_LOGS'
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

export interface ActivityLog {
  id: string;
  createdAt: string;
  action: string;
  description: string;
}

export type OfflineAction = 'CREATE_SALE' | 'CREATE_CUSTOMER' | 'UPDATE_SALE' | 'UPDATE_CUSTOMER' | 'UPDATE_SALE_STATUS' | 'DELETE_SALE' | 'DELETE_CUSTOMER';

export interface OfflinePayload {
  sale?: any;
  customer?: any;
  saleId?: string;
  customerId?: string;
  status?: PaymentStatus;
  paymentDate?: string;
  id?: string;
}

export interface OfflineQueueItem {
  id: string;
  action: OfflineAction;
  payload: OfflinePayload;
  timestamp: number;
  description: string;
}
