export type AnalyticsResponse = {
  filename: string;
  rows_processed: number;
  kpis: {
    total_revenue: number;
    transactions: number;
    units_sold: number;
    average_ticket: number;
    top_product: string;
  };
  analytics: {
    date_range: {
      start: string;
      end: string;
    };
    highest_revenue_product: string;
    sales_by_day: {
      date: string;
      revenue: number;
    }[];
    sales_by_category: {
      category: string;
      revenue: number;
    }[];
    top_products: {
      product: string;
      units: number;
      revenue: number;
    }[];
  };

  insights: {
    type: string;
    title: string;
    message: string;
    value: number;
  }[];

  comparison: {
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

};