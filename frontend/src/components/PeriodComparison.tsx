import { formatCurrency } from "@/lib/formatters";

type Comparison = {
  available: boolean;
  message?: string;

  previous_period?: {
    start: string;
    end: string;
    revenue: number;
    units: number;
  };

  current_period?: {
    start: string;
    end: string;
    revenue: number;
    units: number;
  };

  revenue_change_pct?: number | null;
  units_change_pct?: number | null;

  top_growth_product?: {
    product: string;
    difference: number;
  } | null;

  top_decline_product?: {
    product: string;
    difference: number;
  } | null;
};

type Props = {
  comparison: Comparison;
};

export default function PeriodComparison({
  comparison,
}: Props) {
  if (
    !comparison.available ||
    !comparison.previous_period ||
    !comparison.current_period
  ) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl">
            ℹ️
          </div>

          <div>
            <p className="text-sm font-medium text-blue-700">
              Comparación no disponible
            </p>

            <h3 className="mt-1 text-xl font-semibold text-slate-900">
              El periodo puede analizarse normalmente
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {comparison.message ??
                "No hay suficiente información histórica para comparar este periodo contra otro de la misma duración."}
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Los KPIs, gráficos, productos e insights del periodo seleccionado
              siguen siendo válidos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const revenueChange =
    comparison.revenue_change_pct ?? 0;

  const unitsChange =
    comparison.units_change_pct ?? 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Evolución
        </p>

        <h3 className="mt-1 text-xl font-semibold text-slate-900">
          Comparación entre periodos
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Comparamos el periodo seleccionado contra el periodo inmediatamente
          anterior de la misma duración.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">
            Periodo anterior
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {comparison.previous_period.start}
            {" → "}
            {comparison.previous_period.end}
          </p>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {formatCurrency(
              comparison.previous_period.revenue
            )}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {comparison.previous_period.units} unidades
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-700">
            Periodo seleccionado
          </p>

          <p className="mt-1 text-xs text-blue-500">
            {comparison.current_period.start}
            {" → "}
            {comparison.current_period.end}
          </p>

          <p className="mt-4 text-2xl font-bold text-slate-900">
            {formatCurrency(
              comparison.current_period.revenue
            )}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            {comparison.current_period.units} unidades
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ChangeCard
          title="Variación en ventas"
          value={revenueChange}
        />

        <ChangeCard
          title="Variación en unidades"
          value={unitsChange}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {comparison.top_growth_product && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-700">
              Mayor crecimiento
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {comparison.top_growth_product.product}
            </p>

            <p className="mt-2 text-sm font-semibold text-emerald-700">
              +
              {formatCurrency(
                comparison.top_growth_product.difference
              )}
            </p>
          </div>
        )}

        {comparison.top_decline_product && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-medium text-red-700">
              Mayor caída
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-900">
              {comparison.top_decline_product.product}
            </p>

            <p className="mt-2 text-sm font-semibold text-red-700">
              {formatCurrency(
                comparison.top_decline_product.difference
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


function ChangeCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  const positive = value >= 0;

  return (
    <div
      className={`rounded-xl border p-5 ${
        positive
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <p className="text-sm font-medium text-slate-600">
        {title}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${
          positive
            ? "text-emerald-700"
            : "text-red-700"
        }`}
      >
        {positive ? "+" : ""}
        {value.toFixed(2)}%
      </p>
    </div>
  );
}