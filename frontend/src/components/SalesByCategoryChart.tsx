"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/formatters";

type Props = {
  data: {
    category: string;
    revenue: number;
  }[];
};

export default function SalesByCategoryChart({
  data,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        Ventas por categoría
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Facturación agrupada por categoría
      </p>

      <div className="mt-6 h-72">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="category" />

            <YAxis />

            <Tooltip
              formatter={(value) =>
                formatCurrency(Number(value))
              }
            />

            <Bar
              dataKey="revenue"
              fill="#0f172a"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}