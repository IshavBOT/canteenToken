from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.deps import require_vendor

router = APIRouter(prefix="/revenue", tags=["revenue"])


@router.get("/today", response_model=schemas.RevenueResponse)
def revenue_today(db: DBSession = Depends(get_db), _vendor=Depends(require_vendor)):
    today = date.today()

    tokens_served = (
        db.query(func.count(models.Order.id))
        .filter(models.Order.order_date == today)
        .scalar()
        or 0
    )

    revenue = (
        db.query(func.coalesce(func.sum(models.Order.total_amount), 0))
        .filter(models.Order.order_date == today)
        .scalar()
        or 0
    )

    items_ordered = (
        db.query(func.coalesce(func.sum(models.OrderItem.quantity), 0))
        .join(models.Order, models.Order.id == models.OrderItem.order_id)
        .filter(models.Order.order_date == today)
        .scalar()
        or 0
    )

    top_items_query = (
        db.query(
            models.MenuItem.name,
            func.sum(models.OrderItem.quantity).label("qty"),
        )
        .join(models.OrderItem, models.OrderItem.menu_item_id == models.MenuItem.id)
        .join(models.Order, models.Order.id == models.OrderItem.order_id)
        .filter(models.Order.order_date == today)
        .group_by(models.MenuItem.name)
        .order_by(func.sum(models.OrderItem.quantity).desc())
        .limit(20)
        .all()
    )

    avg_order_value = float(revenue) / tokens_served if tokens_served else 0.0

    return schemas.RevenueResponse(
        date=today,
        tokens_served=tokens_served,
        items_ordered=int(items_ordered),
        revenue=float(revenue),
        avg_order_value=round(avg_order_value, 2),
        top_items=[schemas.TopItem(name=name, quantity=int(qty)) for name, qty in top_items_query],
    )
