import pandas as pd


REQUIRED_COLUMNS = {
    "fecha",
    "producto",
    "categoria",
    "cantidad",
    "precio_unitario",
}


def validate_sales_dataframe(
    df: pd.DataFrame,
) -> None:
    """
    Valida que el DataFrame tenga la estructura mínima
    necesaria para ser procesado por InsightPyme.
    """

    missing_columns = (
        REQUIRED_COLUMNS
        - set(df.columns)
    )

    if missing_columns:
        missing = ", ".join(
            sorted(missing_columns)
        )

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

    # -------------------------
    # Fecha
    # -------------------------

    df["fecha"] = pd.to_datetime(
        df["fecha"],
        errors="coerce",
    )

    if df["fecha"].isna().any():
        raise ValueError(
            "La columna 'fecha' contiene valores inválidos."
        )

    # -------------------------
    # Cantidad
    # -------------------------

    df["cantidad"] = pd.to_numeric(
        df["cantidad"],
        errors="coerce",
    )

    if df["cantidad"].isna().any():
        raise ValueError(
            "La columna 'cantidad' contiene valores inválidos."
        )

    # -------------------------
    # Precio unitario
    # -------------------------

    df["precio_unitario"] = pd.to_numeric(
        df["precio_unitario"],
        errors="coerce",
    )

    if df["precio_unitario"].isna().any():
        raise ValueError(
            "La columna 'precio_unitario' contiene valores inválidos."
        )

    # -------------------------
    # Validaciones de negocio
    # -------------------------

    if (df["cantidad"] <= 0).any():
        raise ValueError(
            "La columna 'cantidad' debe contener valores mayores a 0."
        )

    if (
        df["precio_unitario"] < 0
    ).any():
        raise ValueError(
            "La columna 'precio_unitario' no puede tener valores negativos."
        )

    # -------------------------
    # Total por registro
    # -------------------------

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
        .sort_values(
            ascending=False
        )
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
            "date": date.strftime(
                "%Y-%m-%d"
            ),
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
        df.groupby(
            "categoria"
        )["total_venta"]
        .sum()
        .sort_values(
            ascending=False
        )
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
            units=(
                "cantidad",
                "sum",
            ),
            revenue=(
                "total_venta",
                "sum",
            ),
        )
        .sort_values(
            "revenue",
            ascending=False,
        )
    )

    top_products = [
        {
            "product": product,
            "units": int(
                row["units"]
            ),
            "revenue": round(
                float(
                    row["revenue"]
                ),
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


def generate_sales_insights(
    df: pd.DataFrame,
) -> list[dict]:
    """
    Genera conclusiones automáticas a partir
    de los datos de ventas.
    """

    df = prepare_sales_dataframe(df)

    insights = []

    total_revenue = float(
        df["total_venta"].sum()
    )

    # -------------------------
    # Mejor día de ventas
    # -------------------------

    daily_sales = (
        df.groupby(
            "fecha"
        )["total_venta"]
        .sum()
        .sort_values(
            ascending=False
        )
    )

    if not daily_sales.empty:
        best_day = (
            daily_sales.index[0]
        )

        best_day_revenue = float(
            daily_sales.iloc[0]
        )

        insights.append(
            {
                "type": "best_day",
                "title": (
                    "Mejor día de ventas"
                ),
                "message": (
                    f"El "
                    f"{best_day.strftime('%Y-%m-%d')} "
                    f"fue el día con mayor "
                    f"facturación, con ventas por "
                    f"{best_day_revenue:,.0f} COP."
                ),
                "value": round(
                    best_day_revenue,
                    2,
                ),
            }
        )

    # -------------------------
    # Categoría líder
    # -------------------------

    category_sales = (
        df.groupby(
            "categoria"
        )["total_venta"]
        .sum()
        .sort_values(
            ascending=False
        )
    )

    if not category_sales.empty:
        top_category = (
            category_sales.index[0]
        )

        top_category_revenue = float(
            category_sales.iloc[0]
        )

        category_share = (
            top_category_revenue
            / total_revenue
            * 100
            if total_revenue > 0
            else 0
        )

        insights.append(
            {
                "type": "top_category",
                "title": (
                    "Categoría principal"
                ),
                "message": (
                    f"{top_category} genera "
                    f"el {category_share:.1f}% "
                    f"de la facturación total."
                ),
                "value": round(
                    category_share,
                    2,
                ),
            }
        )

    # -------------------------
    # Producto por facturación
    # -------------------------

    product_revenue = (
        df.groupby(
            "producto"
        )["total_venta"]
        .sum()
        .sort_values(
            ascending=False
        )
    )

    if not product_revenue.empty:
        top_revenue_product = (
            product_revenue.index[0]
        )

        top_revenue_value = float(
            product_revenue.iloc[0]
        )

        insights.append(
            {
                "type": (
                    "top_revenue_product"
                ),
                "title": (
                    "Producto con mayor facturación"
                ),
                "message": (
                    f"{top_revenue_product} "
                    f"es el producto que más "
                    f"factura, con "
                    f"{top_revenue_value:,.0f} COP."
                ),
                "value": round(
                    top_revenue_value,
                    2,
                ),
            }
        )

    # -------------------------
    # Producto por unidades
    # -------------------------

    product_units = (
        df.groupby(
            "producto"
        )["cantidad"]
        .sum()
        .sort_values(
            ascending=False
        )
    )

    if not product_units.empty:
        top_units_product = (
            product_units.index[0]
        )

        top_units = int(
            product_units.iloc[0]
        )

        insights.append(
            {
                "type": (
                    "top_units_product"
                ),
                "title": (
                    "Producto más vendido"
                ),
                "message": (
                    f"{top_units_product} "
                    f"lidera en unidades "
                    f"vendidas con "
                    f"{top_units} unidades."
                ),
                "value": top_units,
            }
        )

    return insights


def calculate_period_comparison(
    df: pd.DataFrame,
) -> dict:
    """
    Compara la primera mitad del periodo
    contra la segunda mitad.
    """

    df = prepare_sales_dataframe(df)

    start_date = df["fecha"].min()
    end_date = df["fecha"].max()

    total_days = (
        end_date - start_date
    ).days + 1

    if total_days < 2:
        return {
            "available": False,
            "message": (
                "No hay suficientes días "
                "para comparar periodos."
            ),
        }

    midpoint = (
        start_date
        + pd.Timedelta(
            days=(
                total_days // 2
            ) - 1
        )
    )

    previous_start = start_date
    previous_end = midpoint

    current_start = (
        midpoint
        + pd.Timedelta(
            days=1
        )
    )

    current_end = end_date

    # -------------------------
    # DataFrames por periodo
    # -------------------------

    previous_df = df[
        (
            df["fecha"]
            >= previous_start
        )
        & (
            df["fecha"]
            <= previous_end
        )
    ]

    current_df = df[
        (
            df["fecha"]
            >= current_start
        )
        & (
            df["fecha"]
            <= current_end
        )
    ]

    # -------------------------
    # Revenue
    # -------------------------

    previous_revenue = float(
        previous_df[
            "total_venta"
        ].sum()
    )

    current_revenue = float(
        current_df[
            "total_venta"
        ].sum()
    )

    # -------------------------
    # Unidades
    # -------------------------

    previous_units = int(
        previous_df[
            "cantidad"
        ].sum()
    )

    current_units = int(
        current_df[
            "cantidad"
        ].sum()
    )

    # -------------------------
    # Variación revenue
    # -------------------------

    if previous_revenue > 0:
        revenue_change_pct = (
            (
                current_revenue
                - previous_revenue
            )
            / previous_revenue
            * 100
        )
    else:
        revenue_change_pct = None

    # -------------------------
    # Variación unidades
    # -------------------------

    if previous_units > 0:
        units_change_pct = (
            (
                current_units
                - previous_units
            )
            / previous_units
            * 100
        )
    else:
        units_change_pct = None

    # -------------------------
    # Productos por periodo
    # -------------------------

    previous_products = (
        previous_df
        .groupby(
            "producto"
        )["total_venta"]
        .sum()
    )

    current_products = (
        current_df
        .groupby(
            "producto"
        )["total_venta"]
        .sum()
    )

    product_comparison = pd.concat(
        [
            previous_products.rename(
                "previous"
            ),
            current_products.rename(
                "current"
            ),
        ],
        axis=1,
    ).fillna(0)

    product_comparison[
        "difference"
    ] = (
        product_comparison[
            "current"
        ]
        - product_comparison[
            "previous"
        ]
    )

    top_growth_product = None
    top_decline_product = None

    if not product_comparison.empty:
        growth_row = (
            product_comparison[
                "difference"
            ].idxmax()
        )

        decline_row = (
            product_comparison[
                "difference"
            ].idxmin()
        )

        top_growth_product = {
            "product": growth_row,
            "difference": round(
                float(
                    product_comparison.loc[
                        growth_row,
                        "difference",
                    ]
                ),
                2,
            ),
        }

        top_decline_product = {
            "product": decline_row,
            "difference": round(
                float(
                    product_comparison.loc[
                        decline_row,
                        "difference",
                    ]
                ),
                2,
            ),
        }

    return {
        "available": True,

        "previous_period": {
            "start": (
                previous_start.strftime(
                    "%Y-%m-%d"
                )
            ),
            "end": (
                previous_end.strftime(
                    "%Y-%m-%d"
                )
            ),
            "revenue": round(
                previous_revenue,
                2,
            ),
            "units": (
                previous_units
            ),
        },

        "current_period": {
            "start": (
                current_start.strftime(
                    "%Y-%m-%d"
                )
            ),
            "end": (
                current_end.strftime(
                    "%Y-%m-%d"
                )
            ),
            "revenue": round(
                current_revenue,
                2,
            ),
            "units": (
                current_units
            ),
        },

        "revenue_change_pct": (
            round(
                revenue_change_pct,
                2,
            )
            if revenue_change_pct
            is not None
            else None
        ),

        "units_change_pct": (
            round(
                units_change_pct,
                2,
            )
            if units_change_pct
            is not None
            else None
        ),

        "top_growth_product": (
            top_growth_product
        ),

        "top_decline_product": (
            top_decline_product
        ),
        
    }

def calculate_custom_period_comparison(
    df: pd.DataFrame,
    current_start: str,
    current_end: str,
) -> dict:
    """
    Compara un periodo seleccionado contra
    el periodo inmediatamente anterior
    de la misma duración.
    """

    df = prepare_sales_dataframe(df)

    start = pd.to_datetime(
        current_start,
        errors="coerce",
    )

    end = pd.to_datetime(
        current_end,
        errors="coerce",
    )

    if pd.isna(start) or pd.isna(end):
        raise ValueError(
            "Las fechas seleccionadas no son válidas."
        )

    if start > end:
        raise ValueError(
            "La fecha inicial no puede ser posterior a la fecha final."
        )

    dataset_start = df["fecha"].min()
    dataset_end = df["fecha"].max()

    if start < dataset_start or end > dataset_end:
        raise ValueError(
            "El periodo seleccionado está fuera del rango disponible."
        )

    period_days = (
        end - start
    ).days + 1

    previous_end = (
        start
        - pd.Timedelta(days=1)
    )

    previous_start = (
        previous_end
        - pd.Timedelta(
            days=period_days - 1
        )
    )

    if previous_start < dataset_start:
        return {
            "available": False,
            "message": (
                "No existen suficientes datos anteriores "
                "para comparar este periodo."
            ),
        }

    current_df = df[
        (df["fecha"] >= start)
        & (df["fecha"] <= end)
    ]

    previous_df = df[
        (df["fecha"] >= previous_start)
        & (df["fecha"] <= previous_end)
    ]

    current_revenue = float(
        current_df["total_venta"].sum()
    )

    previous_revenue = float(
        previous_df["total_venta"].sum()
    )

    current_units = int(
        current_df["cantidad"].sum()
    )

    previous_units = int(
        previous_df["cantidad"].sum()
    )

    revenue_change_pct = (
        (
            current_revenue
            - previous_revenue
        )
        / previous_revenue
        * 100
        if previous_revenue > 0
        else None
    )

    units_change_pct = (
        (
            current_units
            - previous_units
        )
        / previous_units
        * 100
        if previous_units > 0
        else None
    )

    previous_products = (
        previous_df
        .groupby("producto")["total_venta"]
        .sum()
    )

    current_products = (
        current_df
        .groupby("producto")["total_venta"]
        .sum()
    )

    product_comparison = pd.concat(
        [
            previous_products.rename(
                "previous"
            ),
            current_products.rename(
                "current"
            ),
        ],
        axis=1,
    ).fillna(0)

    product_comparison["difference"] = (
        product_comparison["current"]
        - product_comparison["previous"]
    )

    top_growth_product = None
    top_decline_product = None

    if not product_comparison.empty:
        growth_product = (
            product_comparison[
                "difference"
            ].idxmax()
        )

        decline_product = (
            product_comparison[
                "difference"
            ].idxmin()
        )

        top_growth_product = {
            "product": growth_product,
            "difference": round(
                float(
                    product_comparison.loc[
                        growth_product,
                        "difference",
                    ]
                ),
                2,
            ),
        }

        top_decline_product = {
            "product": decline_product,
            "difference": round(
                float(
                    product_comparison.loc[
                        decline_product,
                        "difference",
                    ]
                ),
                2,
            ),
        }

    return {
        "available": True,

        "previous_period": {
            "start": previous_start.strftime(
                "%Y-%m-%d"
            ),
            "end": previous_end.strftime(
                "%Y-%m-%d"
            ),
            "revenue": round(
                previous_revenue,
                2,
            ),
            "units": previous_units,
        },

        "current_period": {
            "start": start.strftime(
                "%Y-%m-%d"
            ),
            "end": end.strftime(
                "%Y-%m-%d"
            ),
            "revenue": round(
                current_revenue,
                2,
            ),
            "units": current_units,
        },

        "revenue_change_pct": (
            round(
                revenue_change_pct,
                2,
            )
            if revenue_change_pct
            is not None
            else None
        ),

        "units_change_pct": (
            round(
                units_change_pct,
                2,
            )
            if units_change_pct
            is not None
            else None
        ),

        "top_growth_product":
            top_growth_product,

        "top_decline_product":
            top_decline_product,
    }