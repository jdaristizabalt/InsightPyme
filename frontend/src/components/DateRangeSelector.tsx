type Props = {
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
};


export default function DateRangeSelector({
  startDate,
  endDate,
  minDate,
  maxDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onReset,
  loading,
}: Props) {
  const comparisonInfo =
    getComparisonInfo(
      startDate,
      endDate,
      minDate
    );


  function applyLastDays(
    days: number
  ) {
    const max =
      parseLocalDate(maxDate);

    const start =
      new Date(max);

    start.setDate(
      max.getDate() - (days - 1)
    );

    const min =
      parseLocalDate(minDate);

    const finalStart =
      start < min
        ? min
        : start;

    onStartDateChange(
      formatDate(finalStart)
    );

    onEndDateChange(
      maxDate
    );
  }


  function applyCurrentMonth() {
    const max =
      parseLocalDate(maxDate);

    const firstDay =
      new Date(
        max.getFullYear(),
        max.getMonth(),
        1
      );

    const min =
      parseLocalDate(minDate);

    const finalStart =
      firstDay < min
        ? min
        : firstDay;

    onStartDateChange(
      formatDate(finalStart)
    );

    onEndDateChange(
      maxDate
    );
  }


  function applyFullPeriod() {
    onStartDateChange(
      minDate
    );

    onEndDateChange(
      maxDate
    );
  }


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Periodo de análisis
        </p>

        <h3 className="mt-1 text-xl font-semibold text-slate-900">
          Filtra el dashboard por fechas
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Los indicadores, gráficos e insights se
          recalcularán para el periodo seleccionado.
        </p>
      </div>

      {/* Accesos rápidos */}

      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Accesos rápidos
        </p>

        <div className="flex flex-wrap gap-3">
          <PresetButton
            label="Todo el periodo"
            onClick={
              applyFullPeriod
            }
          />

          <PresetButton
            label="Últimos 7 días"
            onClick={() =>
              applyLastDays(7)
            }
          />

          <PresetButton
            label="Últimos 30 días"
            onClick={() =>
              applyLastDays(30)
            }
          />

          <PresetButton
            label="Este mes"
            onClick={
              applyCurrentMonth
            }
          />
        </div>
      </div>

      {/* Selección manual */}

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Desde
          </label>

          <input
            type="date"
            value={startDate}
            min={minDate}
            max={
              endDate ||
              maxDate
            }
            onChange={(event) =>
              onStartDateChange(
                event.target.value
              )
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
            min={
              startDate ||
              minDate
            }
            max={maxDate}
            onChange={(event) =>
              onEndDateChange(
                event.target.value
              )
            }
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500"
          />
        </div>
      </div>

      {/* Rango disponible */}

      <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Rango disponible:{" "}
        <span className="font-medium text-slate-700">
          {minDate}
        </span>
        {" → "}
        <span className="font-medium text-slate-700">
          {maxDate}
        </span>
      </div>

      {/* Estado de comparación */}

      {startDate &&
        endDate &&
        comparisonInfo && (
          <div
            className={`mt-4 rounded-xl border p-4 ${
              comparisonInfo.available
                ? "border-emerald-200 bg-emerald-50"
                : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-xl">
                {comparisonInfo.available
                  ? "✅"
                  : "ℹ️"}
              </div>

              <div>
                <p
                  className={`text-sm font-semibold ${
                    comparisonInfo.available
                      ? "text-emerald-800"
                      : "text-blue-800"
                  }`}
                >
                  {comparisonInfo.available
                    ? "Comparación disponible"
                    : "Sin histórico previo suficiente"}
                </p>

                {comparisonInfo.available ? (
                  <p className="mt-1 text-sm text-emerald-700">
                    Este periodo se comparará contra{" "}
                    <span className="font-medium">
                      {
                        comparisonInfo
                          .previousStart
                      }
                    </span>
                    {" → "}
                    <span className="font-medium">
                      {
                        comparisonInfo
                          .previousEnd
                      }
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    Puedes analizar este periodo
                    normalmente, pero para compararlo
                    necesitaríamos datos desde{" "}
                    <span className="font-semibold">
                      {
                        comparisonInfo
                          .requiredStart
                      }
                    </span>
                    .
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Acciones */}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onApply}
          disabled={
            loading ||
            !startDate ||
            !endDate
          }
          className="flex-1 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? "Aplicando..."
            : "Aplicar periodo"}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}


function PresetButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
    >
      {label}
    </button>
  );
}


function getComparisonInfo(
  startDate: string,
  endDate: string,
  minDate: string
) {
  if (
    !startDate ||
    !endDate ||
    !minDate
  ) {
    return null;
  }

  const start =
    parseLocalDate(startDate);

  const end =
    parseLocalDate(endDate);

  const minimum =
    parseLocalDate(minDate);

  const periodMilliseconds =
    end.getTime() -
    start.getTime();

  const periodDays =
    Math.floor(
      periodMilliseconds /
        (1000 * 60 * 60 * 24)
    ) + 1;

  const previousEnd =
    new Date(start);

  previousEnd.setDate(
    previousEnd.getDate() - 1
  );

  const previousStart =
    new Date(previousEnd);

  previousStart.setDate(
    previousStart.getDate() -
      (periodDays - 1)
  );

  const available =
    previousStart >= minimum;

  return {
    available,

    previousStart:
      formatDate(
        previousStart
      ),

    previousEnd:
      formatDate(
        previousEnd
      ),

    requiredStart:
      formatDate(
        previousStart
      ),
  };
}


function parseLocalDate(
  value: string
) {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}


function formatDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return (
    `${year}-${month}-${day}`
  );
}