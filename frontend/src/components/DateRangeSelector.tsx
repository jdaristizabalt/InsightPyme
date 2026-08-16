type Props = {
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

export default function DateRangeSelector({
  startDate,
  endDate,
  minDate,
  maxDate,
  onStartDateChange,
  onEndDateChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Periodo de comparación
        </p>

        <h3 className="mt-1 text-xl font-semibold text-slate-900">
          Selecciona el periodo que quieres analizar
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          InsightPyme lo comparará contra el periodo inmediatamente anterior
          de la misma duración.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Desde
          </label>

          <input
            type="date"
            value={startDate}
            min={minDate}
            max={endDate || maxDate}
            onChange={(event) =>
              onStartDateChange(event.target.value)
            }
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Hasta
          </label>

          <input
            type="date"
            value={endDate}
            min={startDate || minDate}
            max={maxDate}
            onChange={(event) =>
              onEndDateChange(event.target.value)
            }
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Rango disponible: {minDate} → {maxDate}
      </div>
    </div>
  );
}