type FileUploaderProps = {
  file: File | null;
  loading: boolean;
  error: string;
  onFileChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
};

export default function FileUploader({
  file,
  loading,
  error,
  onFileChange,
}: FileUploaderProps) {
  return (
    <div className="mx-auto mt-12 max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-400">
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
              onChange={onFileChange}
              disabled={loading}
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

          {loading && (
            <p className="mt-5 text-sm font-medium text-blue-600">
              Inspeccionando archivo...
            </p>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400">
          <span>✓ CSV</span>
          <span>✓ Excel</span>
          <span>✓ Mapeo flexible</span>
        </div>
      </div>
    </div>
  );
}