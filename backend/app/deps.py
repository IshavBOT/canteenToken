from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from app.database import get_db
from app import models


def get_current_employee(
    authorization: str = Header(default=""),
    db: DBSession = Depends(get_db),
) -> models.Employee:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid Authorization header")

    token = authorization.removeprefix("Bearer ").strip()

    session = db.query(models.Session).filter(models.Session.token == token).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired or invalid, please log in again")

    employee = db.query(models.Employee).filter(models.Employee.employee_id == session.employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Employee not found")

    return employee


def require_vendor(employee: models.Employee = Depends(get_current_employee)) -> models.Employee:
    if employee.role != "vendor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vendor access only")
    return employee
