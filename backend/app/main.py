from io import BytesIO


import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.services.analytics import (
    calculate_sales_analytics,
    calculate_sales_kpis,
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

        return {
            "filename": filename,
            "rows_processed": len(df),
            "kpis": kpis,
            "analytics": analytics,
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