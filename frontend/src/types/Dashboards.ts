export interface TooltipPayloadItem {
  value: number;
  name: string;
  dataKey: string;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export interface DailyStat {
  dayName: string;
  sales: number;
  purchases: number;
}

export interface RecentOrder {
  id: string;
  totalAmount: number;
  createdAt?: string;
  customerName: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  totalProducts: number;
  lowStockCount: number;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
  weeklyStats: DailyStat[];
}
