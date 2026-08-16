"use client";

import { useState } from "react";

import ColumnMapper from "@/components/ColumnMapper";
import DataPreview from "@/components/DataPreview";
import FileUploader from "@/components/FileUploader";
import InsightsPanel from "@/components/InsightsPanel";
import MetricCard from "@/components/MetricCard";
import PeriodComparison from "@/components/PeriodComparison";
import SalesByCategoryChart from "@/components/SalesByCategoryChart";
import SalesByDayChart from "@/components/SalesByDayChart";
import TopProductsTable from "@/components/TopProductsTable";

import { formatCurrency } from "@/lib/formatters";

import type { AnalyticsResponse } from "@/types/analytics";

import type {
  ColumnMapping,
  FileInspection,
  MappedPreview,
} from "@/types/inspection";


const EMPTY_MAPPING: ColumnMapping = {
  fecha: "",
  producto: "",
  categoria: "",
  cantidad: "",
  precio_unitario: "",
};


export default function Home() {
  const [file, setFile] =
    useState<File | null>(null);

  const [inspection, setInspection] =
    useState<FileInspection | null>(null);

  const [preview, setPreview] =
    useState<MappedPreview | null>(null);

  const [mapping, setMapping] =
    useState<ColumnMapping>(
      EMPTY_MAPPING
    );

  const [result, setResult] =
    useState<AnalyticsResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setInspection(null);
    setPreview(null);
    setMapping(EMPTY_MAPPING);
    setResult(null);
    setError("");

    if (!selectedFile) {
      return;
    }

    await inspectFile(
      selectedFile
    );
  }


  async function inspectFile(
    selectedFile: File
  ) {
    setLoading(true);
    setError("");

    const formData =
      new FormData();

    formData.append(
      "file",
      selectedFile
    );

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analytics/inspect",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "No fue posible inspeccionar el archivo."
        );
      }

      setInspection(data);

      setMapping(
        generateInitialMapping(
          data.columns
        )
      );
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Ocurrió un error inesperado."
        );
      }
    } finally {
      setLoading(false);
    }
  }


  function handleMappingChange(
    field: keyof ColumnMapping,
    value: string
  ) {
    setMapping(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setPreview(null);
    setResult(null);
  }


  async function handlePreview() {
    if (!file) {
      return;
    }

    setLoading(true);
    setError("");
    setPreview(null);
    setResult(null);

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "fecha",
      mapping.fecha
    );

    formData.append(
      "producto",
      mapping.producto
    );

    formData.append(
      "categoria",
      mapping.categoria
    );

    formData.append(
      "cantidad",
      mapping.cantidad
    );

    formData.append(
      "precio_unitario",
      mapping.precio_unitario
    );

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analytics/preview-mapped",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "No fue posible generar la vista previa."
        );
      }

      setPreview(data);
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "Ocurrió un error inesperado."
        );
      }
    } finally {
      setLoading(false);
    }
  }


  async function handleAnalyze() {
    if (
      !file ||
      !inspection ||
      !preview
    ) {
      return;
    }

    if (
      !preview.validation
        .can_analyze
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "fecha",
      mapping.fecha
    );

    formData.append(
      "producto",
      mapping.producto
    );

    formData.append(
      "categoria",
      mapping.categoria
    );

    formData.append(
      "cantidad",
      mapping.cantidad
    );

    formData.append(
      "precio_unitario",
      mapping.precio_unitario
    );

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analytics/upload-mapped",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "No fue posible analizar el archivo."
        );
      }

      setResult(data);
    } catch (err) {
      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
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
            v0.3
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
            Carga tu archivo,
            configura las columnas
            y obtén indicadores,
            tendencias e insights
            de tu negocio.
          </p>
        </div>

        <FileUploader
          file={file}
          loading={loading}
          error={error}
          onFileChange={
            handleFileChange
          }
        />

        {inspection && (
          <ColumnMapper
            inspection={
              inspection
            }
            mapping={mapping}
            onMappingChange={
              handleMappingChange
            }
            onPreview={
              handlePreview
            }
            loading={loading}
          />
        )}

        {preview && (
          <>
            <DataPreview
              data={preview}
            />

            <div className="mx-auto mt-6 max-w-4xl">
              <button
                type="button"
                onClick={
                  handleAnalyze
                }
                disabled={
                  loading ||
                  !preview.validation
                    .can_analyze
                }
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "Analizando..."
                  : "Confirmar y analizar ventas"}
              </button>
            </div>
          </>
        )}

        {result && (
          <section className="mx-auto mt-12 max-w-6xl">
            <div className="mb-6">
              <p className="text-sm text-slate-500">
                Archivo analizado
              </p>

              <h3 className="text-xl font-semibold text-slate-900">
                {
                  result.filename
                }
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {
                  result.rows_processed
                }{" "}
                registros procesados
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Ventas totales"
                value={
                  formatCurrency(
                    result.kpis
                      .total_revenue
                  )
                }
              />

              <MetricCard
                title="Unidades vendidas"
                value={
                  String(
                    result.kpis
                      .units_sold
                  )
                }
              />

              <MetricCard
                title="Promedio por registro"
                value={
                  formatCurrency(
                    result.kpis
                      .average_ticket
                  )
                }
              />

              <MetricCard
                title="Producto más vendido"
                value={
                  result.kpis
                    .top_product
                }
              />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Periodo analizado
                </p>

                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {
                    result.analytics
                      .date_range.start
                  }
                  {" → "}
                  {
                    result.analytics
                      .date_range.end
                  }
                </p>
              </div>
            </div>

            <div className="mt-8">
              <PeriodComparison
                comparison={
                  result.comparison
                }
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <SalesByDayChart
                data={
                  result.analytics
                    .sales_by_day
                }
              />

              <SalesByCategoryChart
                data={
                  result.analytics
                    .sales_by_category
                }
              />
            </div>

            <div className="mt-8">
              <TopProductsTable
                products={
                  result.analytics
                    .top_products
                }
              />
            </div>

            <div className="mt-8">
              <InsightsPanel
                insights={
                  result.insights
                }
              />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}


function normalizeColumnName(
  value: string
) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]/g,
      ""
    );
}


function findColumn(
  columns: string[],
  candidates: string[]
) {
  const normalizedCandidates =
    candidates.map(
      normalizeColumnName
    );

  return (
    columns.find(
      (column) =>
        normalizedCandidates.includes(
          normalizeColumnName(
            column
          )
        )
    ) ?? ""
  );
}


function generateInitialMapping(
  columns: string[]
): ColumnMapping {
  return {
    fecha: findColumn(
      columns,
      [
        "fecha",
        "fecha venta",
        "fecha de venta",
        "date",
      ]
    ),

    producto: findColumn(
      columns,
      [
        "producto",
        "descripcion",
        "descripción",
        "item",
        "product",
      ]
    ),

    categoria: findColumn(
      columns,
      [
        "categoria",
        "categoría",
        "familia",
        "category",
      ]
    ),

    cantidad: findColumn(
      columns,
      [
        "cantidad",
        "cant",
        "cant.",
        "qty",
        "quantity",
      ]
    ),

    precio_unitario:
      findColumn(
        columns,
        [
          "precio_unitario",
          "precio unitario",
          "valor unitario",
          "precio",
          "price",
          "unit price",
        ]
      ),
  };
}