from io import BytesIO


import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Form

from app.services.analytics import (
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
        "status": "healthy"
    }


@app.post("/analytics/inspect")
async def inspect_sales_file(
    file: UploadFile = File(...)
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
            .to_dict(orient="records")
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
            detail="No fue posible inspeccionar el archivo.",
        ) from exc

@app.post("/analytics/upload-mapped")
async def upload_mapped_sales_file(
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

        mapping = {
            fecha: "fecha",
            producto: "producto",
            categoria: "categoria",
            cantidad: "cantidad",
            precio_unitario: "precio_unitario",
        }

        missing_source_columns = [
            column
            for column in mapping
            if column not in df.columns
        ]

        if missing_source_columns:
            raise ValueError(
                "No se encontraron las columnas seleccionadas: "
                + ", ".join(missing_source_columns)
            )

        df = df.rename(columns=mapping)

        kpis = calculate_sales_kpis(df)
        analytics = calculate_sales_analytics(df)
        insights = generate_sales_insights(df)

        return {
            "filename": filename,
            "rows_processed": len(df),
            "mapping": {
                "fecha": fecha,
                "producto": producto,
                "categoria": categoria,
                "cantidad": cantidad,
                "precio_unitario": precio_unitario,
            },
            "kpis": kpis,
            "analytics": analytics,
            "insights": insights,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="No fue posible procesar el archivo mapeado.",
        ) from exc

@app.post("/analytics/upload")
async def upload_sales_file(
    file: UploadFile = File(...)
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

        kpis = calculate_sales_kpis(df)
        analytics = calculate_sales_analytics(df)
        insights = generate_sales_insights(df)

        return {
            "filename": filename,
            "rows_processed": len(df),
            "kpis": kpis,
            "analytics": analytics,
            "insights": insights,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="No fue posible procesar el archivo.",
        ) from exc