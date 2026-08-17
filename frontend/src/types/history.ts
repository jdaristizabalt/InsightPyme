export type AnalysisHistoryItem = {
  id: number;
  filename: string;
  rows_processed: number;
  period_start: string;
  period_end: string;
  total_revenue: number;
  transactions: number;
  units_sold: number;
  average_ticket: number;
  top_product: string | null;
  created_at: string;
};