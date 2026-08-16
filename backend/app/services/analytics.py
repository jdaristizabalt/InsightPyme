import pandas as pd


REQUIRED_COLUMNS = {
    "fecha",
    "producto",
    "categoria",
    "cantidad",
    "precio_unitario",
}


def validate_sales_dataframe(df: pd.DataFrame) -> None:
    """
    Valida que el DataFrame tenga la estructura mínima
    necesaria para ser procesado por InsightPyme.
    """

    missing_columns = REQUIRED_COLUMNS - set(df.columns)

    if missing_columns:
        missing = ", ".join(sorted(missing_columns))

        raise ValueError(
            f"Faltan columnas obligatorias: {missing}"
        )

    if df.empty:
        raise ValueError(
            "El archivo no contiene registros de ventas."
        )


def prepare_sales_dataframe(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Limpia y prepara los datos de ventas.
    """

    validate_sales_dataframe(df)

    df = df.copy()

    # Convertir fecha
    df["fecha"] = pd.to_datetime(
        df["fecha"],
        errors="coerce",
    )

    if df["fecha"].isna().any():
        raise ValueError(
            "La columna 'fecha' contiene valores inválidos."
        )

    # Convertir cantidad
    df["cantidad"] = pd.to_numeric(
        df["cantidad"],
        errors="coerce",
    )

    if df["cantidad"].isna().any():
        raise ValueError(
            "La columna 'cantidad' contiene valores inválidos."
        )

    # Convertir precio
    df["precio_unitario"] = pd.to_numeric(
        df["precio_unitario"],
        errors="coerce",
    )

    if df["precio_unitario"].isna().any():
        raise ValueError(
            "La columna 'precio_unitario' contiene valores inválidos."
        )

    # Validaciones de negocio
    if (df["cantidad"] <= 0).any():
        raise ValueError(
            "La columna 'cantidad' debe contener valores mayores a 0."
        )

    if (df["precio_unitario"] < 0).any():
        raise ValueError(
            "La columna 'precio_unitario' no puede tener valores negativos."
        )

    # Total por registro
    df["total_venta"] = (
        df["cantidad"]
        * df["precio_unitario"]
    )

    return df


def calculate_sales_kpis(
    df: pd.DataFrame,
) -> dict:
    """
    Calcula KPIs generales de ventas.
    """

    df = prepare_sales_dataframe(df)

    total_revenue = float(
        df["total_venta"].sum()
    )

    transactions = int(
        len(df)
    )

    units_sold = int(
        df["cantidad"].sum()
    )

    average_ticket = (
        total_revenue / transactions
        if transactions > 0
        else 0
    )

    product_units = (
        df.groupby("producto")["cantidad"]
        .sum()
        .sort_values(ascending=False)
    )

    top_product = (
        product_units.index[0]
        if not product_units.empty
        else None
    )

    return {
        "total_revenue": round(
            total_revenue,
            2,
        ),
        "transactions": transactions,
        "units_sold": units_sold,
        "average_ticket": round(
            average_ticket,
            2,
        ),
        "top_product": top_product,
    }


def calculate_sales_analytics(
    df: pd.DataFrame,
) -> dict:
    """
    Genera análisis detallados para alimentar
    el dashboard de InsightPyme.
    """

    df = prepare_sales_dataframe(df)

    # -------------------------
    # Ventas por día
    # -------------------------

    sales_by_day = (
        df.groupby("fecha")["total_venta"]
        .sum()
        .sort_index()
    )

    sales_by_day_result = [
        {
            "date": date.strftime("%Y-%m-%d"),
            "revenue": round(
                float(revenue),
                2,
            ),
        }
        for date, revenue
        in sales_by_day.items()
    ]

    # -------------------------
    # Ventas por categoría
    # -------------------------

    sales_by_category = (
        df.groupby("categoria")["total_venta"]
        .sum()
        .sort_values(ascending=False)
    )

    sales_by_category_result = [
        {
            "category": category,
            "revenue": round(
                float(revenue),
                2,
            ),
        }
        for category, revenue
        in sales_by_category.items()
    ]

    # -------------------------
    # Productos
    # -------------------------

    products = (
        df.groupby("producto")
        .agg(
            units=("cantidad", "sum"),
            revenue=("total_venta", "sum"),
        )
        .sort_values(
            "revenue",
            ascending=False,
        )
    )

    top_products = [
        {
            "product": product,
            "units": int(row["units"]),
            "revenue": round(
                float(row["revenue"]),
                2,
            ),
        }
        for product, row
        in products.head(10).iterrows()
    ]

    # -------------------------
    # Producto con más revenue
    # -------------------------

    highest_revenue_product = (
        products.index[0]
        if not products.empty
        else None
    )

    # -------------------------
    # Fechas
    # -------------------------

    start_date = df["fecha"].min()
    end_date = df["fecha"].max()

    return {
        "date_range": {
            "start": start_date.strftime(
                "%Y-%m-%d"
            ),
            "end": end_date.strftime(
                "%Y-%m-%d"
            ),
        },
        "highest_revenue_product": (
            highest_revenue_product
        ),
        "sales_by_day": (
            sales_by_day_result
        ),
        "sales_by_category": (
            sales_by_category_result
        ),
        "top_products": (
            top_products
        ),
    }