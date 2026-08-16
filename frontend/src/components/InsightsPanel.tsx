type Insight = {
  type: string;
  title: string;
  message: string;
  value: number;
};

type Props = {
  insights: Insight[];
};

export default function InsightsPanel({
  insights,
}: Props) {
  const iconByType: Record<string, string> = {
    best_day: "📅",
    top_category: "📈",
    top_revenue_product: "🏆",
    top_units_product: "📦",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          Insights de tu negocio
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Conclusiones automáticas generadas a partir de tus ventas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {insights.map((insight) => (
          <div
            key={insight.type}
            className="rounded-xl border border-slate-200 bg-slate-50 p-5"
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl">
                {iconByType[insight.type] ?? "💡"}
              </div>

              <div>
                <h4 className="font-semibold text-slate-900">
                  {insight.title}
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {insight.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}