from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.AuthResponse)
def signup(payload: schemas.SignupRequest, db: DBSession = Depends(get_db)):
    existing = db.query(models.Employee).filter(models.Employee.employee_id == payload.employee_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already registered, try logging in instead")

    employee = models.Employee(
        employee_id=payload.employee_id,
        name=payload.name,
        mobile=payload.mobile,
        role="customer",
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)

    session = models.Session(employee_id=employee.employee_id)
    db.add(session)
    db.commit()
    db.refresh(session)

    return schemas.AuthResponse(
        token=str(session.token),
        employee_id=employee.employee_id,
        name=employee.name,
        role=employee.role,
    )


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.LoginRequest, db: DBSession = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == payload.employee_id).first()
    if not employee or employee.mobile != payload.mobile:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Employee ID and mobile number don't match our records")

    session = models.Session(employee_id=employee.employee_id)
    db.add(session)
    db.commit()
    db.refresh(session)

    return schemas.AuthResponse(
        token=str(session.token),
        employee_id=employee.employee_id,
        name=employee.name,
        role=employee.role,
    )
