"use client";

import { useState } from "react";

type AnalyticsResponse = {
  filename: string;
  rows_processed: number;
  kpis: {
    total_revenue: number;
    transactions: number;
    units_sold: number;
    average_ticket: number;
    top_product: string;
  };
  analytics: {
    date_range: {
      start: string;
      end: string;
    };
    highest_revenue_product: string;
    sales_by_day: {
      date: string;
      revenue: number;
    }[];
    sales_by_category: {
      category: string;
      revenue: number;
    }[];
    top_products: {
      product: string;
      units: number;
      revenue: number;
    }[];
  };
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] =
    useState<AnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setResult(null);
    setError("");
  }

  async function handleAnalyze() {
    if (!file) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analytics/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "No fue posible analizar el archivo."
        );
      }

      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Ocurrió un error inesperado."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              InsightPyme
            </h1>

            <p className="text-sm text-slate-500">
              Inteligencia para entender mejor tu negocio
            </p>
          </div>

          <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            v0.2
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            Analítica de ventas para pequeños negocios
          </span>

          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Convierte tus ventas en decisiones
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Carga tu archivo de ventas y obtén
            automáticamente indicadores y análisis
            de tu negocio.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
                📊
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Carga tus datos de ventas
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Selecciona un archivo CSV o Excel
              </p>

              <label className="mt-6 inline-flex cursor-pointer items-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                Seleccionar archivo

                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {file && (
                <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-medium text-emerald-800">
                    ✓ {file.name}
                  </p>

                  <p className="mt-1 text-xs text-emerald-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>

            {file && (
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Analizando..."
                  : "Analizar ventas"}
              </button>
            )}

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {result && (
          <section className="mx-auto mt-12 max-w-6xl">
            <div className="mb-6">
              <p className="text-sm text-slate-500">
                Archivo analizado
              </p>

              <h3 className="text-xl font-semibold text-slate-900">
                {result.filename}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {result.rows_processed} registros procesados
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Ventas totales"
                value={formatCurrency(
                  result.kpis.total_revenue
                )}
              />

              <MetricCard
                title="Unidades vendidas"
                value={String(
                  result.kpis.units_sold
                )}
              />

              <MetricCard
                title="Promedio por registro"
                value={formatCurrency(
                  result.kpis.average_ticket
                )}
              />

              <MetricCard
                title="Producto más vendido"
                value={result.kpis.top_product}
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">
                  Producto con mayor facturación
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {
                    result.analytics
                      .highest_revenue_product
                  }
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">
                  Periodo analizado
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {result.analytics.date_range.start}
                  {" → "}
                  {result.analytics.date_range.end}
                </p>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}


function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}


function formatCurrency(value: number) {
  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }
  ).format(value);
}