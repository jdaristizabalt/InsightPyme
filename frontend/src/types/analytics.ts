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

};