import { formatCurrency } from "@/lib/formatters";
import type { AnalysisHistoryItem } from "@/types/history";

type Props = {
  history: AnalysisHistoryItem[];
  loading: boolean;
  onViewDetail: (id: number) => void;
};

export default function AnalysisHistory({
  history,
  loading,
  onViewDetail,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Historial
        </p>

        <h3 className="mt-1 text-xl font-semibold text-slate-900">
          Análisis realizados
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Consulta los análisis que InsightPyme ha guardado anteriormente.
        </p>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">
          Cargando historial...
        </p>
      ) : history.length === 0 ? (
        <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
          <p className="text-sm text-slate-500">
            Todavía no hay análisis guardados.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  ID
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Archivo
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Periodo
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Ventas
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Unidades
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Producto top
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Fecha análisis
                </th>

                <th className="px-4 py-3 text-xs font-semibold uppercase text-slate-500">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-4 py-4 text-sm font-medium text-slate-900">
                    #{item.id}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-700">
                    {item.filename}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {item.period_start}
                    {" → "}
                    {item.period_end}
                  </td>

                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrency(
                      item.total_revenue
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {item.units_sold}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-600">
                    {item.top_product ?? "—"}
                  </td>

                  <td className="px-4 py-4 text-sm text-slate-500">
                    {formatCreatedAt(
                      item.created_at
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        onViewDetail(
                          item.id
                        )
                      }
                      className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


function formatCreatedAt(
  value: string
) {
  const date = new Date(
    value
  );

  return new Intl.DateTimeFormat(
    "es-CO",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}