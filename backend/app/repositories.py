from datetime import date

from sqlalchemy.orm import Session

from app.models import AnalysisHistory


def save_analysis_history(
    db: Session,
    *,
    filename: str,
    rows_processed: int,
    period_start: date,
    period_end: date,
    total_revenue: float,
    transactions: int,
    units_sold: int,
    average_ticket: float,
    top_product: str | None,
) -> AnalysisHistory:
    record = AnalysisHistory(
        filename=filename,
        rows_processed=rows_processed,
        period_start=period_start,
        period_end=period_end,
        total_revenue=total_revenue,
        transactions=transactions,
        units_sold=units_sold,
        average_ticket=average_ticket,
        top_product=top_product,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return record

def get_analysis_history(
    db: Session,
    limit: int = 50,
) -> list[AnalysisHistory]:
    return (
        db.query(AnalysisHistory)
        .order_by(
            AnalysisHistory.id.desc()
        )
        .limit(limit)
        .all()
    )