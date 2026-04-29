// ==========================================
// Business Central API v2.0 Types
// ==========================================

export interface PurchaseOrder {
  '@odata.etag'?: string;
  id: string;
  number: string;
  orderDate: string;
  postingDate: string;
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  status: 'Draft' | 'In Review' | 'Open';
  totalAmountExcludingTax: number;
  totalTaxAmount: number;
  totalAmountIncludingTax: number;
  fullyReceived: boolean;
  buyFromAddressLine1: string;
  buyFromAddressLine2: string;
  buyFromCity: string;
  buyFromState: string;
  buyFromCountry: string;
  buyFromPostCode: string;
  shipToAddressLine1: string;
  shipToAddressLine2: string;
  shipToCity: string;
  shipToState: string;
  shipToCountry: string;
  shipToPostCode: string;
  currencyCode: string;
  paymentTermsId: string;
  shipmentMethodId: string;
  requestedReceiptDate: string;
  discountAmount: number;
  lastModifiedDateTime: string;
  purchaseOrderLines?: PurchaseOrderLine[];
}

export interface PurchaseOrderLine {
  '@odata.etag'?: string;
  id: string;
  sequence: number;
  itemId: string;
  lineType: 'Item' | 'Account' | 'Resource';
  lineObjectNumber: string;
  description: string;
  unitOfMeasureCode: string;
  quantity: number;
  directUnitCost: number;
  discountPercent: number;
  discountAmount: number;
  amountExcludingTax: number;
  amountIncludingTax: number;
  taxCode: string;
  expectedReceiptDate: string;
  receivedQuantity: number;
  invoicedQuantity: number;
}

export interface Vendor {
  id: string;
  number: string;
  displayName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  balance: number;
  blocked: string;
  currencyCode: string;
  paymentTermsId: string;
}

export interface Item {
  id: string;
  number: string;
  displayName: string;
  type: 'Inventory' | 'Service' | 'Non-Inventory';
  unitPrice: number;
  unitCost: number;
  inventory: number;
  baseUnitOfMeasureCode: string;
  blocked: boolean;
  itemCategoryCode: string;
}

export interface PurchaseInvoice {
  id: string;
  number: string;
  postingDate: string;
  invoiceDate: string;
  vendorName: string;
  vendorNumber: string;
  totalAmountExcludingTax: number;
  totalAmountIncludingTax: number;
  status: string;
  orderNumber: string;
}

export interface UnitOfMeasure {
  id: string;
  code: string;
  displayName: string;
}

export interface Location {
  id: string;
  code: string;
  displayName: string;
}

// ==========================================
// App Types
// ==========================================

export interface DraftOrderLine {
  tempId: string;
  itemId: string;
  itemNumber: string;
  description: string;
  quantity: number;
  directUnitCost: number;
  discountPercent: number;
  unitOfMeasureCode: string;
  lineType: 'Item' | 'Account' | 'Resource';
}

export interface DraftOrder {
  vendorId: string;
  vendorNumber: string;
  vendorName: string;
  orderDate: string;
  requestedReceiptDate: string;
  notes: string;
  lines: DraftOrderLine[];
}

export interface FilterState {
  status: 'All' | 'Draft' | 'Open' | 'In Review' | 'Received';
  searchQuery: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  isLoggedIn: boolean;
}

// ==========================================
// API Response Types
// ==========================================

export interface BCApiResponse<T> {
  value: T[];
  '@odata.context'?: string;
  '@odata.count'?: number;
}

export interface BCApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface ODataQueryParams {
  $filter?: string;
  $orderby?: string;
  $top?: number;
  $expand?: string;
  $select?: string;
  $skip?: number;
  $count?: boolean;
}

// ==========================================
// Navigation Types
// ==========================================

export type DashboardStackParamList = {
  DashboardHome: undefined;
  OrderDetail: { orderId: string };
  CreateOrder: { prefillData?: DraftOrder };
  EditOrder: { orderId: string };
};

export type OrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { orderId: string };
  EditOrder: { orderId: string };
};

export type CreateStackParamList = {
  CreateOrder: { prefillData?: DraftOrder };
  ScanDocument: undefined;
};

export type InvoicesStackParamList = {
  InvoiceList: undefined;
  InvoiceDetail: { invoiceId: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
};

export type RootTabParamList = {
  DashboardTab: undefined;
  OrdersTab: undefined;
  CreateTab: undefined;
  InvoicesTab: undefined;
  SettingsTab: undefined;
};
