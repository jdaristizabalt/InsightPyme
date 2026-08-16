import { formatCurrency } from "@/lib/formatters";
import type { MappedPreview } from "@/types/inspection";

type Props = {
  data: MappedPreview;
};

function getRowIssues(row: {
  fecha: string;
  producto: string;
  categoria: string;
  cantidad: string;
  precio_unitario: string;
}) {
  const issues: string[] = [];

  const parsedDate = Date.parse(row.fecha);

  if (!row.fecha) {
    issues.push("Fecha vacía");
  } else if (Number.isNaN(parsedDate)) {
    issues.push("Fecha inválida");
  }

  if (!row.producto.trim()) {
    issues.push("Producto vacío");
  }

  if (!row.categoria.trim()) {
    issues.push("Categoría vacía");
  }

  const cantidad = Number(row.cantidad);

  if (!row.cantidad) {
    issues.push("Cantidad vacía");
  } else if (Number.isNaN(cantidad)) {
    issues.push("Cantidad no numérica");
  } else if (cantidad <= 0) {
    issues.push("Cantidad debe ser mayor que 0");
  }

  const precio = Number(row.precio_unitario);

  if (!row.precio_unitario) {
    issues.push("Precio vacío");
  } else if (Number.isNaN(precio)) {
    issues.push("Precio no numérico");
  } else if (precio < 0) {
    issues.push("Precio negativo");
  }

  return issues;
}

export default function DataPreview({
  data,
}: Props) {
  const validationItems = [
    {
      label: "Fechas inválidas",
      value:
        data.validation.invalid_fecha +
        data.validation.missing_fecha,
      severity: "error",
    },
    {
      label: "Productos vacíos",
      value: data.validation.missing_producto,
      severity: "error",
    },
    {
      label: "Categorías vacías",
      value: data.validation.missing_categoria,
      severity: "warning",
    },
    {
      label: "Cantidades inválidas",
      value:
        data.validation.invalid_cantidad +
        data.validation.missing_cantidad +
        data.validation.non_positive_cantidad,
      severity: "error",
    },
    {
      label: "Precios inválidos",
      value:
        data.validation.invalid_precio_unitario +
        data.validation.missing_precio_unitario +
        data.validation.negative_precio_unitario,
      severity: "error",
    },
  ];

  const hasBlockingErrors =
    data.validation.blocking_errors > 0;

  const hasWarnings =
    data.validation.warnings > 0;

  function downloadErrorReport() {
    if (data.problematic_rows.length === 0) {
      return;
    }

    const header = [
      "fila",
      "fecha",
      "producto",
      "categoria",
      "cantidad",
      "precio_unitario",
      "problemas",
    ];

    const rows = data.problematic_rows.map((row) => {
      const issues = getRowIssues(row);

      return [
        Number(row.row_index) + 2,
        row.fecha,
        row.producto,
        row.categoria,
        row.cantidad,
        row.precio_unitario,
        issues.join(" | "),
      ];
    });

    const escapeCsvValue = (
      value: string | number
    ) => {
      const text = String(value ?? "");

      return `"${text.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      header.map(escapeCsvValue).join(","),
      ...rows.map((row) =>
        row.map(escapeCsvValue).join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "insightpyme_errores.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

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
              Mostramos las primeras 5 filas usando el mapeo seleccionado.
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
                          Number(row.precio_unitario)
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
          hasBlockingErrors
            ? "border-red-200 bg-red-50"
            : hasWarnings
              ? "border-amber-200 bg-amber-50"
              : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">
            {hasBlockingErrors
              ? "❌"
              : hasWarnings
                ? "⚠️"
                : "✅"}
          </div>

          <div>
            <h3
              className={`font-semibold ${
                hasBlockingErrors
                  ? "text-red-900"
                  : hasWarnings
                    ? "text-amber-900"
                    : "text-emerald-900"
              }`}
            >
              {hasBlockingErrors
                ? "El archivo contiene errores que bloquean el análisis"
                : hasWarnings
                  ? "El archivo puede analizarse, pero tiene advertencias"
                  : "La calidad del archivo es correcta"}
            </h3>

            <p
              className={`mt-1 text-sm ${
                hasBlockingErrors
                  ? "text-red-700"
                  : hasWarnings
                    ? "text-amber-700"
                    : "text-emerald-700"
              }`}
            >
              InsightPyme validó fechas, productos, categorías, cantidades y
              precios antes de ejecutar el análisis.
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
                    ? item.severity === "error"
                      ? "text-red-700"
                      : "text-amber-700"
                    : "text-emerald-700"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {data.problematic_rows.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">
                Filas problemáticas
              </p>

              <h3 className="mt-1 text-xl font-semibold text-slate-900">
                Registros que requieren revisión
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Mostramos hasta 10 filas con errores detectados para que puedas
                identificar qué debes corregir en el archivo original.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadErrorReport}
              className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Descargar errores CSV
            </button>
          </div>

          <div className="space-y-4">
            {data.problematic_rows.map((row) => {
              const issues = getRowIssues(row);

              return (
                <div
                  key={`${row.row_index}-${row.producto}`}
                  className="rounded-xl border border-red-100 bg-red-50 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">
                        Fila {Number(row.row_index) + 2}
                      </p>

                      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p>
                          <span className="font-medium">
                            Fecha:
                          </span>{" "}
                          {row.fecha || "Vacío"}
                        </p>

                        <p>
                          <span className="font-medium">
                            Producto:
                          </span>{" "}
                          {row.producto || "Vacío"}
                        </p>

                        <p>
                          <span className="font-medium">
                            Categoría:
                          </span>{" "}
                          {row.categoria || "Vacío"}
                        </p>

                        <p>
                          <span className="font-medium">
                            Cantidad:
                          </span>{" "}
                          {row.cantidad || "Vacío"}
                        </p>

                        <p>
                          <span className="font-medium">
                            Precio:
                          </span>{" "}
                          {row.precio_unitario || "Vacío"}
                        </p>
                      </div>

                      {issues.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                            Problemas detectados
                          </p>

                          <ul className="mt-2 space-y-1">
                            {issues.map((issue) => (
                              <li
                                key={issue}
                                className="text-sm text-red-700"
                              >
                                • {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="self-start rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700">
                      Revisar
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}