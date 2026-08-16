export type FileInspection = {
  filename: string;
  rows: number;
  columns: string[];
  preview: Record<string, string>[];
};

export type ColumnMapping = {
  fecha: string;
  producto: string;
  categoria: string;
  cantidad: string;
  precio_unitario: string;
};