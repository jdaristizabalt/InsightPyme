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

export type MappedPreview = {
  filename: string;
  preview: {
    fecha: string;
    producto: string;
    categoria: string;
    cantidad: string;
    precio_unitario: string;
  }[];
  validation: {
    total_rows: number;
    missing_fecha: number;
    missing_producto: number;
    missing_categoria: number;
    missing_cantidad: number;
    missing_precio_unitario: number;
  };
};