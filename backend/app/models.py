from datetime import date, datetime

from sqlalchemy import (
    Date,
    DateTime,
    Float,
    Integer,
    String,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
)


class Base(DeclarativeBase):
    pass


class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    rows_processed: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    period_start: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    period_end: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    total_revenue: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    transactions: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    units_sold: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    average_ticket: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    top_product: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )