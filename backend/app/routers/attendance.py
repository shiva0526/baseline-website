from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from .. import models, schemas
from ..database import get_db
from ..deps import require_role
from datetime import date as date_cls
from typing import Dict

router = APIRouter(prefix="/attendance", tags=["attendance"])


# ---------------------------
# GET attendance for a specific date
# ---------------------------
@router.get("/{day}", response_model=Dict[int, bool])
def get_attendance_for_date(day: date_cls, db: Session = Depends(get_db)):
    """Get attendance status for all players on a specific date"""
    # Ensure we're using the date as provided without timezone conversion
    records = (
        db.query(models.Attendance)
        .filter(models.Attendance.date == day)
        .all()
    )
    return {rec.player_id: rec.status for rec in records}

# ---------------------------
# GET all players with attendance count
# ---------------------------
@router.get("/", response_model=list[schemas.PlayerOut])
def get_players(db: Session = Depends(get_db)):
    players = db.query(models.Player).all()
    result = []
    for p in players:
        attended_count = (
            db.query(models.Attendance)
            .filter(models.Attendance.player_id == p.id, models.Attendance.status == True)
            .count()
        )
        result.append({
            "id": p.id,
            "name": p.name,
            "program": p.program,   # ✅ correct field
            "attendedClasses": attended_count,
        })
    return result



# ---------------------------
# BULK update attendance
# ---------------------------
@router.put("/{day}")
def bulk_update_attendance(day: date_cls, payload: Dict[str, Dict[int, bool]], db: Session = Depends(get_db)):
    """
    Payload: { "attendance": { "1": true, "2": false } }
    """
    incoming = payload.get("attendance")
    if incoming is None:
        raise HTTPException(status_code=400, detail="Missing 'attendance' in request body")

    for pid, present in incoming.items():
        rec = db.query(models.Attendance).filter(
            and_(models.Attendance.player_id == int(pid), models.Attendance.date == day)
        ).first()
        if rec:
            rec.status = present   # boolean
        else:
            rec = models.Attendance(player_id=int(pid), date=day, status=present)
            db.add(rec)

    db.commit()
    return {"status": "ok", "date": day.isoformat(), "updated": len(incoming)}

