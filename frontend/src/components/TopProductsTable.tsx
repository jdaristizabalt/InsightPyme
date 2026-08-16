import { formatCurrency } from "@/lib/formatters";

type Props = {
  products: {
    product: string;
    units: number;
    revenue: number;
  }[];
};

export default function TopProductsTable({
  products,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Top productos
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Productos ordenados por facturación
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                Producto
              </th>

              <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                Unidades
              </th>

              <th className="px-6 py-3 text-xs font-semibold uppercase text-slate-500">
                Facturación
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.product}
                className="border-t border-slate-100"
              >
                <td className="px-6 py-4 font-medium text-slate-900">
                  {product.product}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {product.units}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {formatCurrency(product.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}