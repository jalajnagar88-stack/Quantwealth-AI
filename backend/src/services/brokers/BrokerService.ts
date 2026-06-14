export interface IBrokerService {
  getAuthorizationUrl(userId: string): string;
  handleCallback(code: string, userId: string): Promise<BrokerConnection>;
  getHoldings(accessToken: string): Promise<HoldingsData[]>;
  getFunds(accessToken: string): Promise<FundsData>;
  placeOrder(accessToken: string, order: OrderRequest): Promise<OrderResult>;
  modifyOrder(accessToken: string, orderId: string, updates: Partial<OrderRequest>): Promise<OrderResult>;
  cancelOrder(accessToken: string, orderId: string): Promise<boolean>;
  getOrderHistory(accessToken: string): Promise<OrderResult[]>;
  getOrderStatus(accessToken: string, orderId: string): Promise<OrderResult>;
  refreshToken(refreshToken: string): Promise<TokenRefreshResult>;
}

export interface BrokerConnection {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  brokerUserId?: string;
  brokerUserName?: string;
}

export interface HoldingsData {
  symbol: string;
  exchange: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface FundsData {
  availableCash: number;
  usedMargin: number;
  totalBalance: number;
  collateral: number;
  realizedPnL: number;
  unrealizedPnL: number;
}

export interface OrderRequest {
  symbol: string;
  exchange: 'NSE' | 'BSE';
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M';
  productType: 'CNC' | 'MIS' | 'NRML';
  price?: number;
  triggerPrice?: number;
  tag?: string;
}

export interface OrderResult {
  orderId: string;
  status: 'PENDING' | 'OPEN' | 'COMPLETE' | 'CANCELLED' | 'REJECTED';
  symbol: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  filledQuantity: number;
  averagePrice?: number;
  message?: string;
  timestamp: Date;
}

export interface TokenRefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// Base class with common functionality
export abstract class BaseBrokerService implements IBrokerService {
  protected apiKey: string;
  protected apiSecret: string;
  protected redirectUri: string;
  protected baseUrl: string;

  constructor(apiKey: string, apiSecret: string, redirectUri: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.redirectUri = redirectUri;
    this.baseUrl = baseUrl;
  }

  abstract getAuthorizationUrl(userId: string): string;
  abstract handleCallback(code: string, userId: string): Promise<BrokerConnection>;
  abstract getHoldings(accessToken: string): Promise<HoldingsData[]>;
  abstract getFunds(accessToken: string): Promise<FundsData>;
  abstract placeOrder(accessToken: string, order: OrderRequest): Promise<OrderResult>;
  abstract modifyOrder(accessToken: string, orderId: string, updates: Partial<OrderRequest>): Promise<OrderResult>;
  abstract cancelOrder(accessToken: string, orderId: string): Promise<boolean>;
  abstract getOrderHistory(accessToken: string): Promise<OrderResult[]>;
  abstract getOrderStatus(accessToken: string, orderId: string): Promise<OrderResult>;
  abstract refreshToken(refreshToken: string): Promise<TokenRefreshResult>;

  // Common utility methods
  protected async makeApiRequest<T>(
    endpoint: string,
    accessToken: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || `API request failed: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Broker API error (${endpoint}):`, error);
      throw error;
    }
  }

  // Validate order before sending to broker
  protected validateOrder(order: OrderRequest): string | null {
    if (!order.symbol || order.symbol.length < 1) {
      return 'Invalid symbol';
    }
    if (order.quantity <= 0) {
      return 'Quantity must be greater than 0';
    }
    if (order.orderType === 'LIMIT' && (!order.price || order.price <= 0)) {
      return 'Price required for limit orders';
    }
    if ((order.orderType === 'SL' || order.orderType === 'SL-M') && (!order.triggerPrice || order.triggerPrice <= 0)) {
      return 'Trigger price required for SL orders';
    }
    return null;
  }
}
