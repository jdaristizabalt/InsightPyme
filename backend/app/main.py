from io import BytesIO

import pandas as pd
from fastapi import (
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware

from app.services.analytics import (
    calculate_custom_period_comparison,
    calculate_period_comparison,
    calculate_sales_analytics,
    calculate_sales_kpis,
    generate_sales_insights,
)


app = FastAPI(
    title="InsightPyme API",
    description=(
        "API para procesamiento y análisis "
        "de datos de ventas."
    ),
    version="0.1.0",
)


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": "InsightPyme",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
    }


# ============================================================
# INSPECCIÓN INICIAL DEL ARCHIVO
# ============================================================

@app.post("/analytics/inspect")
async def inspect_sales_file(
    file: UploadFile = File(...),
):
    allowed_extensions = (
        ".csv",
        ".xlsx",
    )

    filename = file.filename or ""

    if not filename.lower().endswith(
        allowed_extensions
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Formato no soportado. "
                "Utiliza CSV o XLSX."
            ),
        )

    try:
        contents = await file.read()
        buffer = BytesIO(contents)

        if filename.lower().endswith(".csv"):
            df = pd.read_csv(buffer)
        else:
            df = pd.read_excel(buffer)

        if df.empty:
            raise ValueError(
                "El archivo no contiene registros."
            )

        preview = (
            df.head(5)
            .fillna("")
            .astype(str)
            .to_dict(
                orient="records"
            )
        )

        return {
            "filename": filename,
            "rows": len(df),
            "columns": df.columns.tolist(),
            "preview": preview,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "No fue posible inspeccionar "
                "el archivo."
            ),
        ) from exc


# ============================================================
# ANÁLISIS CON MAPEO FLEXIBLE
# ============================================================

@app.post("/analytics/upload-mapped")
async def upload_mapped_sales_file(
    file: UploadFile = File(...),
    fecha: str = Form(...),
    producto: str = Form(...),
    categoria: str = Form(...),
    cantidad: str = Form(...),
    precio_unitario: str = Form(...),
    fecha_inicio: str | None = Form(None),
    fecha_fin: str | None = Form(None),
):
    allowed_extensions = (
        ".csv",
        ".xlsx",
    )

    filename = file.filename or ""

    if not filename.lower().endswith(
        allowed_extensions
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Formato no soportado. "
                "Utiliza CSV o XLSX."
            ),
        )

    try:
        contents = await file.read()
        buffer = BytesIO(contents)

        if filename.lower().endswith(".csv"):
            df = pd.read_csv(buffer)
        else:
            df = pd.read_excel(buffer)

        # Eliminar espacios accidentales
        # introducidos en el formulario.
        fecha = fecha.strip()
        producto = producto.strip()
        categoria = categoria.strip()
        cantidad = cantidad.strip()
        precio_unitario = (
            precio_unitario.strip()
        )

        mapping = {
            fecha: "fecha",
            producto: "producto",
            categoria: "categoria",
            cantidad: "cantidad",
            precio_unitario:
                "precio_unitario",
        }

        missing_source_columns = [
            column
            for column in mapping
            if column not in df.columns
        ]

        if missing_source_columns:
            raise ValueError(
                "No se encontraron las "
                "columnas seleccionadas: "
                + ", ".join(
                    missing_source_columns
                )
            )

        # Normalizamos los nombres
        # al esquema interno de InsightPyme.
        df = df.rename(
            columns=mapping
        )

        # ----------------------------------------------------
        # DATASET FILTRADO PARA EL DASHBOARD
        # ----------------------------------------------------

        filtered_df = df.copy()

        if fecha_inicio and fecha_fin:
            parsed_start = pd.to_datetime(
                fecha_inicio,
                errors="coerce",
            )

            parsed_end = pd.to_datetime(
                fecha_fin,
                errors="coerce",
            )

            if (
                pd.isna(parsed_start)
                or pd.isna(parsed_end)
            ):
                raise ValueError(
                    "Las fechas seleccionadas "
                    "no son válidas."
                )

            if parsed_start > parsed_end:
                raise ValueError(
                    "La fecha inicial no puede "
                    "ser posterior a la fecha final."
                )

            parsed_dates = pd.to_datetime(
                filtered_df["fecha"],
                errors="coerce",
            )

            filtered_df = filtered_df[
                (
                    parsed_dates
                    >= parsed_start
                )
                & (
                    parsed_dates
                    <= parsed_end
                )
            ].copy()

            if filtered_df.empty:
                raise ValueError(
                    "No existen registros "
                    "dentro del periodo seleccionado."
                )

        # ----------------------------------------------------
        # ANALÍTICA DEL PERIODO SELECCIONADO
        # ----------------------------------------------------

        kpis = calculate_sales_kpis(
            filtered_df
        )

        analytics = (
            calculate_sales_analytics(
                filtered_df
            )
        )

        insights = (
            generate_sales_insights(
                filtered_df
            )
        )

        # ----------------------------------------------------
        # COMPARACIÓN
        #
        # IMPORTANTE:
        # Utilizamos df completo para poder acceder
        # al periodo inmediatamente anterior.
        # ----------------------------------------------------

        if fecha_inicio and fecha_fin:
            comparison = (
                calculate_custom_period_comparison(
                    df,
                    fecha_inicio,
                    fecha_fin,
                )
            )
        else:
            comparison = (
                calculate_period_comparison(
                    df
                )
            )

        return {
            "filename": filename,
            "rows_processed": len(
                filtered_df
            ),
            "mapping": {
                "fecha": fecha,
                "producto": producto,
                "categoria": categoria,
                "cantidad": cantidad,
                "precio_unitario":
                    precio_unitario,
            },
            "kpis": kpis,
            "analytics": analytics,
            "insights": insights,
            "comparison": comparison,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "No fue posible procesar "
                "el archivo mapeado."
            ),
        ) from exc


# ============================================================
# VISTA PREVIA Y CONTROL DE CALIDAD
# ============================================================

@app.post("/analytics/preview-mapped")
async def preview_mapped_sales_file(
    file: UploadFile = File(...),
    fecha: str = Form(...),
    producto: str = Form(...),
    categoria: str = Form(...),
    cantidad: str = Form(...),
    precio_unitario: str = Form(...),
):
    allowed_extensions = (
        ".csv",
        ".xlsx",
    )

    filename = file.filename or ""

    if not filename.lower().endswith(
        allowed_extensions
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Formato no soportado. "
                "Utiliza CSV o XLSX."
            ),
        )

    try:
        contents = await file.read()
        buffer = BytesIO(contents)

        if filename.lower().endswith(".csv"):
            df = pd.read_csv(buffer)
        else:
            df = pd.read_excel(buffer)

        fecha = fecha.strip()
        producto = producto.strip()
        categoria = categoria.strip()
        cantidad = cantidad.strip()
        precio_unitario = (
            precio_unitario.strip()
        )

        mapping = {
            fecha: "fecha",
            producto: "producto",
            categoria: "categoria",
            cantidad: "cantidad",
            precio_unitario:
                "precio_unitario",
        }

        missing_source_columns = [
            column
            for column in mapping
            if column not in df.columns
        ]

        if missing_source_columns:
            raise ValueError(
                "No se encontraron las "
                "columnas seleccionadas: "
                + ", ".join(
                    missing_source_columns
                )
            )

        df = df.rename(
            columns=mapping
        )

        required_columns = [
            "fecha",
            "producto",
            "categoria",
            "cantidad",
            "precio_unitario",
        ]

        df = df[
            required_columns
        ].copy()

        # ----------------------------------------------------
        # CONVERSIONES DE PRUEBA
        # ----------------------------------------------------

        parsed_fecha = pd.to_datetime(
            df["fecha"],
            errors="coerce",
        )

        parsed_cantidad = pd.to_numeric(
            df["cantidad"],
            errors="coerce",
        )

        parsed_precio = pd.to_numeric(
            df["precio_unitario"],
            errors="coerce",
        )

        # ----------------------------------------------------
        # VALIDACIONES
        # ----------------------------------------------------

        missing_fecha = int(
            df["fecha"]
            .isna()
            .sum()
        )

        invalid_fecha = int(
            (
                parsed_fecha.isna()
                & df["fecha"].notna()
            ).sum()
        )

        missing_producto = int(
            (
                df["producto"].isna()
                | (
                    df["producto"]
                    .astype(str)
                    .str.strip()
                    == ""
                )
            ).sum()
        )

        missing_categoria = int(
            (
                df["categoria"].isna()
                | (
                    df["categoria"]
                    .astype(str)
                    .str.strip()
                    == ""
                )
            ).sum()
        )

        missing_cantidad = int(
            df["cantidad"]
            .isna()
            .sum()
        )

        invalid_cantidad = int(
            (
                parsed_cantidad.isna()
                & df["cantidad"].notna()
            ).sum()
        )

        non_positive_cantidad = int(
            (
                parsed_cantidad.notna()
                & (
                    parsed_cantidad
                    <= 0
                )
            ).sum()
        )

        missing_precio = int(
            df["precio_unitario"]
            .isna()
            .sum()
        )

        invalid_precio = int(
            (
                parsed_precio.isna()
                & (
                    df[
                        "precio_unitario"
                    ].notna()
                )
            ).sum()
        )

        negative_precio = int(
            (
                parsed_precio.notna()
                & (
                    parsed_precio
                    < 0
                )
            ).sum()
        )

        blocking_errors = (
            missing_fecha
            + invalid_fecha
            + missing_producto
            + missing_cantidad
            + invalid_cantidad
            + non_positive_cantidad
            + missing_precio
            + invalid_precio
            + negative_precio
        )

        warnings = (
            missing_categoria
        )

        # ----------------------------------------------------
        # FILAS PROBLEMÁTICAS
        # ----------------------------------------------------

        problematic_mask = (
            parsed_fecha.isna()
            | df["producto"].isna()
            | (
                df["producto"]
                .astype(str)
                .str.strip()
                == ""
            )
            | parsed_cantidad.isna()
            | (
                parsed_cantidad.notna()
                & (
                    parsed_cantidad
                    <= 0
                )
            )
            | parsed_precio.isna()
            | (
                parsed_precio.notna()
                & (
                    parsed_precio
                    < 0
                )
            )
        )

        problematic_rows = (
            df[
                problematic_mask
            ]
            .head(10)
            .fillna("")
            .astype(str)
            .reset_index()
            .rename(
                columns={
                    "index":
                        "row_index"
                }
            )
            .to_dict(
                orient="records"
            )
        )

        preview = (
            df.head(5)
            .fillna("")
            .astype(str)
            .to_dict(
                orient="records"
            )
        )

        validation = {
            "total_rows":
                len(df),

            "missing_fecha":
                missing_fecha,

            "invalid_fecha":
                invalid_fecha,

            "missing_producto":
                missing_producto,

            "missing_categoria":
                missing_categoria,

            "missing_cantidad":
                missing_cantidad,

            "invalid_cantidad":
                invalid_cantidad,

            "non_positive_cantidad":
                non_positive_cantidad,

            "missing_precio_unitario":
                missing_precio,

            "invalid_precio_unitario":
                invalid_precio,

            "negative_precio_unitario":
                negative_precio,

            "blocking_errors":
                blocking_errors,

            "warnings":
                warnings,

            "can_analyze":
                blocking_errors == 0,
        }

        return {
            "filename":
                filename,
            "preview":
                preview,
            "validation":
                validation,
            "problematic_rows":
                problematic_rows,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "No fue posible generar "
                "la vista previa."
            ),
        ) from exc


# ============================================================
# ANÁLISIS CON ESTRUCTURA ESTÁNDAR
# ============================================================

@app.post("/analytics/upload")
async def upload_sales_file(
    file: UploadFile = File(...),
):
    allowed_extensions = (
        ".csv",
        ".xlsx",
    )

    filename = file.filename or ""

    if not filename.lower().endswith(
        allowed_extensions
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Formato no soportado. "
                "Utiliza CSV o XLSX."
            ),
        )

    try:
        contents = await file.read()

        buffer = BytesIO(contents)

        if filename.lower().endswith(".csv"):
            df = pd.read_csv(buffer)
        else:
            df = pd.read_excel(buffer)

        kpis = calculate_sales_kpis(
            df
        )

        analytics = (
            calculate_sales_analytics(
                df
            )
        )

        insights = (
            generate_sales_insights(
                df
            )
        )

        comparison = (
            calculate_period_comparison(
                df
            )
        )

        return {
            "filename": filename,
            "rows_processed":
                len(df),
            "kpis": kpis,
            "analytics":
                analytics,
            "insights":
                insights,
            "comparison":
                comparison,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "No fue posible procesar "
                "el archivo."
            ),
        ) from exc