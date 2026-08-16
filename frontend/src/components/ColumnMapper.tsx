import type {
  ColumnMapping,
  FileInspection,
} from "@/types/inspection";

type Props = {
  inspection: FileInspection;
  mapping: ColumnMapping;
  onMappingChange: (
    field: keyof ColumnMapping,
    value: string
  ) => void;
  onAnalyze: () => void;
  loading: boolean;
};

const fields: {
  key: keyof ColumnMapping;
  label: string;
}[] = [
  {
    key: "fecha",
    label: "Fecha",
  },
  {
    key: "producto",
    label: "Producto",
  },
  {
    key: "categoria",
    label: "Categoría",
  },
  {
    key: "cantidad",
    label: "Cantidad",
  },
  {
    key: "precio_unitario",
    label: "Precio unitario",
  },
];

export default function ColumnMapper({
  inspection,
  mapping,
  onMappingChange,
  onAnalyze,
  loading,
}: Props) {
  const mappingComplete = Object.values(
    mapping
  ).every(Boolean);

  return (
    <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Archivo reconocido
        </p>

        <h3 className="mt-1 text-xl font-semibold text-slate-900">
          Configura las columnas
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Encontramos {inspection.rows} registros y{" "}
          {inspection.columns.length} columnas.
          Indica qué columna corresponde a cada dato.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {fields.map((field) => (
          <div
            key={field.key}
            className="grid items-center gap-3 md:grid-cols-2"
          >
            <label className="font-medium text-slate-700">
              {field.label}
            </label>

            <select
              value={mapping[field.key]}
              onChange={(event) =>
                onMappingChange(
                  field.key,
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-blue-500"
            >
              <option value="">
                Selecciona una columna
              </option>

              {inspection.columns.map(
                (column) => (
                  <option
                    key={column}
                    value={column}
                  >
                    {column}
                  </option>
                )
              )}
            </select>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={
          loading || !mappingComplete
        }
        className="mt-8 w-full rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading
          ? "Analizando..."
          : "Analizar ventas"}
      </button>
    </div>
  );
}