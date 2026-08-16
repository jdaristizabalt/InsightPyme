import { formatCurrency } from "@/lib/formatters";
import type { MappedPreview } from "@/types/inspection";

type Props = {
  data: MappedPreview;
};

export default function DataPreview({
  data,
}: Props) {
  const validationItems = [
    {
      label: "Fechas vacías",
      value: data.validation.missing_fecha,
    },
    {
      label: "Productos vacíos",
      value: data.validation.missing_producto,
    },
    {
      label: "Categorías vacías",
      value: data.validation.missing_categoria,
    },
    {
      label: "Cantidades vacías",
      value: data.validation.missing_cantidad,
    },
    {
      label: "Precios vacíos",
      value:
        data.validation.missing_precio_unitario,
    },
  ];

  const hasIssues = validationItems.some(
    (item) => item.value > 0
  );

  return (
    <div className="mx-auto mt-8 max-w-6xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Vista previa
            </p>

            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              Revisa tus datos antes de analizar
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Mostramos las primeras 5 filas
              usando el mapeo seleccionado.
            </p>
          </div>

          <div className="text-sm text-slate-500">
            {data.validation.total_rows} registros
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Fecha
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Producto
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Categoría
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Cantidad
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Precio unitario
                </th>
              </tr>
            </thead>

            <tbody>
              {data.preview.map((row, index) => (
                <tr
                  key={`${row.producto}-${index}`}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {row.fecha || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-slate-900">
                    {row.producto || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {row.categoria || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {row.cantidad || "—"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {row.precio_unitario
                      ? formatCurrency(
                          Number(
                            row.precio_unitario
                          )
                        )
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`rounded-2xl border p-6 shadow-sm ${
          hasIssues
            ? "border-amber-200 bg-amber-50"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">
            {hasIssues ? "⚠️" : "✅"}
          </div>

          <div>
            <h3
              className={`font-semibold ${
                hasIssues
                  ? "text-amber-900"
                  : "text-emerald-900"
              }`}
            >
              {hasIssues
                ? "Encontramos datos que debes revisar"
                : "La estructura básica del archivo es correcta"}
            </h3>

            <p
              className={`mt-1 text-sm ${
                hasIssues
                  ? "text-amber-700"
                  : "text-emerald-700"
              }`}
            >
              InsightPyme revisó campos vacíos
              en las columnas principales.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {validationItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-white/70 p-4"
            >
              <p className="text-xs font-medium text-slate-500">
                {item.label}
              </p>

              <p
                className={`mt-2 text-xl font-bold ${
                  item.value > 0
                    ? "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}