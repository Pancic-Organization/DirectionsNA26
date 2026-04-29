import axios, { AxiosInstance, AxiosError } from 'axios';
import { appConfig } from '../config/appConfig';
import {
  PurchaseOrder,
  PurchaseOrderLine,
  Vendor,
  Item,
  PurchaseInvoice,
  UnitOfMeasure,
  Location,
  BCApiResponse,
  BCApiError,
  ODataQueryParams,
} from '../types';

// ==========================================
// Token Management
// ==========================================

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now + 60000) {
    return cachedToken;
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', appConfig.entraId.clientId);
  params.append('client_secret', appConfig.entraId.clientSecret);
  params.append('scope', appConfig.entraId.scope);

  const response = await axios.post(appConfig.entraId.tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  cachedToken = response.data.access_token;
  tokenExpiry = now + response.data.expires_in * 1000;
  return cachedToken!;
}

// ==========================================
// API Client
// ==========================================

function buildQueryString(params?: ODataQueryParams): string {
  if (!params) return '';
  const parts: string[] = [];
  if (params.$filter) parts.push(`$filter=${encodeURIComponent(params.$filter)}`);
  if (params.$orderby) parts.push(`$orderby=${encodeURIComponent(params.$orderby)}`);
  if (params.$top !== undefined) parts.push(`$top=${params.$top}`);
  if (params.$skip !== undefined) parts.push(`$skip=${params.$skip}`);
  if (params.$expand) parts.push(`$expand=${encodeURIComponent(params.$expand)}`);
  if (params.$select) parts.push(`$select=${encodeURIComponent(params.$select)}`);
  if (params.$count) parts.push(`$count=true`);
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

async function createClient(): Promise<AxiosInstance> {
  const token = await getAccessToken();
  const client = axios.create({
    baseURL: appConfig.bc.baseUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Retry once on 401 (token may have been revoked server-side)
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && cachedToken) {
        cachedToken = null;
        tokenExpiry = 0;
        const newToken = await getAccessToken();
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios.request(error.config);
      }
      return Promise.reject(error);
    }
  );

  return client;
}

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<BCApiError>;
    const bcError = axiosError.response?.data?.error;
    if (bcError) {
      throw new Error(`BC API Error [${bcError.code}]: ${bcError.message}`);
    }
    if (axiosError.response) {
      throw new Error(`API Error ${axiosError.response.status}: ${axiosError.message}`);
    }
    throw new Error(`Network Error: ${axiosError.message}`);
  }
  throw error;
}

// ==========================================
// Vendors
// ==========================================

export async function getVendors(params?: ODataQueryParams): Promise<Vendor[]> {
  try {
    const client = await createClient();
    const qs = buildQueryString(params);
    const response = await client.get<BCApiResponse<Vendor>>(`/vendors${qs}`);
    return response.data.value;
  } catch (error) {
    handleApiError(error);
  }
}

// ==========================================
// Items
// ==========================================

export async function getItems(params?: ODataQueryParams): Promise<Item[]> {
  try {
    const client = await createClient();
    const qs = buildQueryString(params);
    const response = await client.get<BCApiResponse<Item>>(`/items${qs}`);
    return response.data.value;
  } catch (error) {
    handleApiError(error);
  }
}

// ==========================================
// Purchase Orders
// ==========================================

export async function getPurchaseOrders(params?: ODataQueryParams): Promise<PurchaseOrder[]> {
  try {
    const client = await createClient();
    const qs = buildQueryString(params);
    const response = await client.get<BCApiResponse<PurchaseOrder>>(`/purchaseOrders${qs}`);
    return response.data.value;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  try {
    const client = await createClient();
    const response = await client.get<PurchaseOrder>(`/purchaseOrders(${id})`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createPurchaseOrder(
  data: Partial<PurchaseOrder>
): Promise<PurchaseOrder> {
  try {
    const client = await createClient();
    const response = await client.post<PurchaseOrder>('/purchaseOrders', data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updatePurchaseOrder(
  id: string,
  data: Partial<PurchaseOrder>,
  etag?: string
): Promise<PurchaseOrder> {
  try {
    const client = await createClient();
    const headers: Record<string, string> = {};
    if (etag) headers['If-Match'] = etag;
    const response = await client.patch<PurchaseOrder>(`/purchaseOrders(${id})`, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  try {
    const client = await createClient();
    await client.delete(`/purchaseOrders(${id})`);
  } catch (error) {
    handleApiError(error);
  }
}

// ==========================================
// Purchase Order Lines
// ==========================================

export async function getPurchaseOrderLines(
  orderId: string,
  params?: ODataQueryParams
): Promise<PurchaseOrderLine[]> {
  try {
    const client = await createClient();
    const qs = buildQueryString(params);
    const response = await client.get<BCApiResponse<PurchaseOrderLine>>(
      `/purchaseOrders(${orderId})/purchaseOrderLines${qs}`
    );
    return response.data.value;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createPurchaseOrderLine(
  orderId: string,
  data: Partial<PurchaseOrderLine>
): Promise<PurchaseOrderLine> {
  try {
    const client = await createClient();
    const response = await client.post<PurchaseOrderLine>(
      `/purchaseOrders(${orderId})/purchaseOrderLines`,
      data
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updatePurchaseOrderLine(
  orderId: string,
  lineId: string,
  data: Partial<PurchaseOrderLine>,
  etag?: string
): Promise<PurchaseOrderLine> {
  try {
    const client = await createClient();
    const headers: Record<string, string> = {};
    if (etag) headers['If-Match'] = etag;
    const response = await client.patch<PurchaseOrderLine>(
      `/purchaseOrders(${orderId})/purchaseOrderLines(${lineId})`,
      data,
      { headers }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function deletePurchaseOrderLine(
  orderId: string,
  lineId: string
): Promise<void> {
  try {
    const client = await createClient();
    await client.delete(
      `/purchaseOrders(${orderId})/purchaseOrderLines(${lineId})`
    );
  } catch (error) {
    handleApiError(error);
  }
}

// ==========================================
// Actions
// ==========================================

export async function receiveAndInvoice(orderId: string): Promise<void> {
  try {
    const client = await createClient();
    await client.post(
      `/purchaseOrders(${orderId})/Microsoft.NAV.receiveAndInvoice`
    );
  } catch (error) {
    handleApiError(error);
  }
}

// ==========================================
// Purchase Invoices
// ==========================================

export async function getPurchaseInvoices(
  params?: ODataQueryParams
): Promise<PurchaseInvoice[]> {
  try {
    const client = await createClient();
    const qs = buildQueryString(params);
    const response = await client.get<BCApiResponse<PurchaseInvoice>>(
      `/purchaseInvoices${qs}`
    );
    return response.data.value;
  } catch (error) {
    handleApiError(error);
  }
}

// ==========================================
// Units of Measure
// ==========================================

export async function getUnitsOfMeasure(
  params?: ODataQueryParams
): Promise<UnitOfMeasure[]> {
  try {
    const client = await createClient();
    const qs = buildQueryString(params);
    const response = await client.get<BCApiResponse<UnitOfMeasure>>(
      `/unitsOfMeasure${qs}`
    );
    return response.data.value;
  } catch (error) {
    handleApiError(error);
  }
}

// ==========================================
// Locations
// ==========================================

export async function getLocations(params?: ODataQueryParams): Promise<Location[]> {
  try {
    const client = await createClient();
    const qs = buildQueryString(params);
    const response = await client.get<BCApiResponse<Location>>(`/locations${qs}`);
    return response.data.value;
  } catch (error) {
    handleApiError(error);
  }
}

// ==========================================
// Connection Test
// ==========================================

export async function testConnection(): Promise<boolean> {
  try {
    const client = await createClient();
    await client.get('/vendors?$top=1');
    return true;
  } catch {
    return false;
  }
}
