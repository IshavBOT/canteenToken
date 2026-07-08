from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession, joinedload
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.deps import get_current_employee, require_vendor

router = APIRouter(prefix="/orders", tags=["orders"])

VALID_STATUSES = ["waiting", "preparing", "ready", "collected"]
RECENT_LIMIT = 5  # how many entries to show per column


def _serialize_order(order: models.Order) -> schemas.OrderOut:
    return schemas.OrderOut(
        id=order.id,
        token_number=order.token_number,
        employee_id=order.employee_id,
        status=order.status,
        total_amount=float(order.total_amount),
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[
            schemas.OrderItemOut(menu_item_name=item.menu_item.name, quantity=item.quantity)
            for item in order.items
        ],
    )


@router.get("/menu", response_model=List[schemas.MenuItemOut])
def get_menu(db: DBSession = Depends(get_db)):
    return db.query(models.MenuItem).order_by(models.MenuItem.name).all()


@router.get("/board", response_model=schemas.BoardResponse)
def get_board(db: DBSession = Depends(get_db), _employee=Depends(get_current_employee)):
    today = date.today()
    base = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.menu_item))
        .filter(models.Order.order_date == today)
    )

    preparing = base.filter(models.Order.status == "preparing").order_by(models.Order.created_at.desc()).limit(RECENT_LIMIT).all()
    ordered = base.filter(models.Order.status == "waiting").order_by(models.Order.created_at.desc()).limit(RECENT_LIMIT).all()
    prepared = (
        base.filter(models.Order.status.in_(["ready", "collected"]))
        .order_by(models.Order.updated_at.desc())
        .limit(RECENT_LIMIT)
        .all()
    )

    latest_ready = (
        db.query(models.Order)
        .filter(models.Order.order_date == today, models.Order.status == "ready")
        .order_by(models.Order.updated_at.desc())
        .first()
    )

    return schemas.BoardResponse(
        now_serving=latest_ready.token_number if latest_ready else None,
        preparing=[_serialize_order(o) for o in preparing],
        ordered=[_serialize_order(o) for o in ordered],
        prepared=[_serialize_order(o) for o in prepared],
    )


@router.get("/mine", response_model=List[schemas.OrderOut])
def get_my_orders(db: DBSession = Depends(get_db), employee=Depends(get_current_employee)):
    today = date.today()
    orders = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.menu_item))
        .filter(models.Order.order_date == today, models.Order.employee_id == employee.employee_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return [_serialize_order(o) for o in orders]


@router.post("", response_model=schemas.OrderOut)
def create_order(
    payload: schemas.CreateOrderRequest,
    db: DBSession = Depends(get_db),
    _vendor=Depends(require_vendor),
):
    customer = db.query(models.Employee).filter(models.Employee.employee_id == payload.employee_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="No employee found with that ID. Ask them to sign up first.")

    if not payload.items:
        raise HTTPException(status_code=400, detail="Add at least one item to the order")

    today = date.today()
    next_token = (
        db.query(func.coalesce(func.max(models.Order.token_number), 0))
        .filter(models.Order.order_date == today)
        .scalar()
        + 1
    )

    total_amount = 0.0
    order_items = []
    for line in payload.items:
        menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == line.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {line.menu_item_id} not found")
        total_amount += float(menu_item.price) * line.quantity
        order_items.append(models.OrderItem(menu_item_id=menu_item.id, quantity=line.quantity))

    order = models.Order(
        token_number=next_token,
        employee_id=customer.employee_id,
        status="waiting",
        order_date=today,
        total_amount=total_amount,
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.menu_item))
        .filter(models.Order.id == order.id)
        .first()
    )
    return _serialize_order(order)


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
def update_status(
    order_id: int,
    payload: schemas.UpdateStatusRequest,
    db: DBSession = Depends(get_db),
    _vendor=Depends(require_vendor),
):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status must be one of {VALID_STATUSES}")

    order = (
        db.query(models.Order)
        .options(joinedload(models.Order.items).joinedload(models.OrderItem.menu_item))
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return _serialize_order(order)
