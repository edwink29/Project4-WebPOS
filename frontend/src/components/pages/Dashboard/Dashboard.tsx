import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  PackageOpen,
  ReceiptText,
  TrendingUp,
} from "lucide-react";
import { dashboardService } from "@/services/DashboardServices";
import type { DashboardSummary } from "@/types/Dashboards";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const date = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "-";

function Graph({
  data,
  dataKey,
  title,
  subtitle,
  color,
  total,
}: {
  data: DashboardSummary["weeklyStats"];
  dataKey: "sales" | "purchases";
  title: string;
  subtitle: string;
  color: "blue" | "violet";
  total: number;
}) {
  const stroke = color === "blue" ? "#2563eb" : "#7c3aed";
  const gradient = `${dataKey}Gradient`;
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-bold text-slate-800">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${color === "blue" ? "bg-blue-50 text-blue-700" : "bg-violet-50 text-violet-700"}`}
        >
          {rupiah(total)}
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: -16 }}>
            <defs>
              <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eef2f7" />
            <XAxis
              dataKey="dayName"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v / 1000}k`}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <Tooltip
              formatter={(v) => rupiah(Number(v))}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              name={title}
              stroke={stroke}
              strokeWidth={3}
              fill={`url(#${gradient})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    dashboardService
      .getSummary()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  const sales = useMemo(
    () => data?.weeklyStats.reduce((sum, item) => sum + item.sales, 0) ?? 0,
    [data],
  );
  const purchases = useMemo(
    () => data?.weeklyStats.reduce((sum, item) => sum + item.purchases, 0) ?? 0,
    [data],
  );
  if (loading)
    return (
      <div className="min-h-[calc(100vh-80px)] animate-pulse bg-slate-50 p-6">
        <div className="h-28 rounded-2xl bg-slate-200" />
      </div>
    );
  if (error || !data)
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-6 text-sm text-slate-500">
        Data dashboard belum dapat dimuat. Silakan muat ulang halaman.
      </div>
    );

  const margin = data.totalRevenue
    ? Math.max(0, (data.totalProfit / data.totalRevenue) * 100)
    : 0;
  const metrics = [
    [
      "Total omzet",
      rupiah(data.totalRevenue),
      "Akumulasi seluruh penjualan",
      CircleDollarSign,
      "bg-blue-50 text-blue-600",
      "Pendapatan bisnis",
      false,
    ],
    [
      "Estimasi profit",
      rupiah(data.totalProfit),
      `Margin ${margin.toFixed(1)}% dari omzet`,
      TrendingUp,
      "bg-emerald-50 text-emerald-600",
      "Keuntungan bersih",
      false,
    ],
    [
      "Total transaksi",
      data.totalOrders.toLocaleString("id-ID"),
      "Pesanan yang telah tercatat",
      ReceiptText,
      "bg-violet-50 text-violet-600",
      "Aktivitas penjualan",
      false,
    ],
    [
      "Stok menipis",
      data.lowStockCount.toLocaleString("id-ID"),
      `dari ${data.totalProducts} produk tersedia`,
      AlertTriangle,
      "bg-amber-50 text-amber-600",
      "Perlu perhatian",
      data.lowStockCount > 0,
    ],
  ] as const;
  const stock = [
    {
      name: "Stok aman",
      value: Math.max(0, data.totalProducts - data.lowStockCount),
      color: "#2563eb",
    },
    { name: "Stok menipis", value: data.lowStockCount, color: "#f59e0b" },
  ];

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f7f9fc] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-375 space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm font-semibold text-blue-600">
              Ringkasan bisnis
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard Penjualan
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pantau performa toko dan ambil keputusan lebih cepat.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm">
            <CalendarDays size={15} className="text-blue-600" />
            Diperbarui hari ini
          </div>
        </header>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(
            ([label, value, hint, Icon, iconColor, trend, warning]) => (
              <article
                key={label}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      {value}
                    </p>
                  </div>
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-xl ${iconColor}`}
                  >
                    <Icon size={21} />
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs">
                  {warning ? (
                    <ArrowDownRight size={14} className="text-amber-500" />
                  ) : (
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  )}
                  <span
                    className={
                      warning
                        ? "font-semibold text-amber-600"
                        : "font-semibold text-emerald-600"
                    }
                  >
                    {trend}
                  </span>
                  <span className="truncate text-slate-400">· {hint}</span>
                </div>
              </article>
            ),
          )}
        </section>
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Graph
            data={data.weeklyStats}
            dataKey="sales"
            title="Penjualan 7 Hari Terakhir"
            subtitle="Nilai transaksi harian"
            color="blue"
            total={sales}
          />
          <Graph
            data={data.weeklyStats}
            dataKey="purchases"
            title="Pembelian 7 Hari Terakhir"
            subtitle="Nilai pengadaan stok harian"
            color="violet"
            total={purchases}
          />
        </section>
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">Transaksi terbaru</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pesanan terakhir yang masuk ke sistem
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-140 text-left">
                <thead className="border-y border-slate-100 bg-slate-50/70 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Pelanggan</th>
                    <th className="px-4 py-3">ID Pesanan</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentOrders.length ? (
                    data.recentOrders.map((item) => (
                      <tr key={item.id} className="text-sm text-slate-600">
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {item.customerName}
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-400">
                          #{item.id.slice(-7).toUpperCase()}
                        </td>
                        <td className="px-4 py-4">{date(item.createdAt)}</td>
                        <td className="px-4 py-4 text-right font-bold text-slate-800">
                          {rupiah(item.totalAmount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-sm text-slate-400"
                      >
                        Belum ada transaksi tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
          <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-slate-800">Status inventaris</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Kondisi stok produk
                </p>
              </div>
              <Boxes size={20} className="text-slate-400" />
            </div>
            <div className="relative mt-3 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stock}
                    dataKey="value"
                    innerRadius={38}
                    outerRadius={54}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {stock.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <span className="text-xl font-bold text-slate-800">
                  {data.totalProducts}
                </span>
                <span className="-mt-5 text-[10px] text-slate-400">produk</span>
              </div>
            </div>
            <div className="mt-2 space-y-3">
              {stock.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-500">
                    <i
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-700">
              <b>Perhatian: </b>
              {data.lowStockCount
                ? `${data.lowStockCount} produk memiliki stok rendah dan perlu segera dipantau.`
                : "Semua stok produk berada dalam kondisi aman."}
            </div>
          </article>
        </section>
        {data.lowStockProducts.length > 0 && (
          <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <PackageOpen size={17} />
              </span>
              <div>
                <h2 className="font-bold text-slate-800">
                  Produk yang perlu restock
                </h2>
                <p className="text-xs text-slate-500">
                  Prioritaskan pengadaan untuk menjaga ketersediaan barang.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {data.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Sisa stok</p>
                  <p className="mt-1 text-lg font-bold text-amber-600">
                    {product.stock}{" "}
                    <span className="text-xs font-medium">unit</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
