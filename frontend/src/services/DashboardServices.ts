import { environment } from "@/constants/environment";
import { fetchAPI } from "@/utils/fetch";
import type { Order, OrderItem } from "@/types/Orders";
import type { Purchase } from "@/types/Purchases";
import type { Product } from "@/types/Products";
import type {
  DashboardSummary,
  RecentOrder,
  DailyStat,
  LowStockProduct,
} from "@/types/Dashboards";

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const [orders, purchases, products] = await Promise.all([
      fetchAPI<Order[]>(`${environment.API_URL}/orders`, { method: "GET" }),
      fetchAPI<Purchase[]>(`${environment.API_URL}/purchases`, {
        method: "GET",
      }),
      fetchAPI<Product[]>(`${environment.API_URL}/products`, { method: "GET" }),
    ]);

    let totalRevenue = 0;
    let totalProfit = 0;

    orders.forEach((order: Order) => {
      totalRevenue += order.totalAmount || 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: OrderItem) => {
          const profitPerItem =
            (item.sellPrice - item.buyPrice) * item.quantity;
          totalProfit += profitPerItem;
        });
      }
    });

    const lowStockList = products.filter((p: Product) => p.stock <= 5);

    const recentOrders: RecentOrder[] = orders.slice(0, 5).map((o: Order) => ({
      id: o.id,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      customerName: o.customer?.name || "Umum",
    }));

    const lowStockProducts: LowStockProduct[] = lowStockList
      .slice(0, 5)
      .map((p: Product) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
      }));

    // Kalkulasi Data Grafik 7 Hari Terakhir
    const dayNames = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const weeklyStats: DailyStat[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const daySales = orders
        .filter((o) => o.createdAt && o.createdAt.startsWith(dateStr))
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const dayPurchases = purchases
        .filter((p) => p.createdAt && p.createdAt.startsWith(dateStr))
        .reduce((sum, p) => sum + p.totalAmount, 0);

      weeklyStats.push({
        dayName: dayNames[d.getDay()],
        sales: daySales,
        purchases: dayPurchases,
      });
    }

    return {
      totalRevenue,
      totalProfit,
      totalOrders: orders.length,
      totalProducts: products.length,
      lowStockCount: lowStockList.length,
      recentOrders,
      lowStockProducts,
      weeklyStats,
    };
  },
};
