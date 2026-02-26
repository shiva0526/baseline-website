from datetime import date, timedelta
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_
from io import BytesIO
import pandas as pd
import calendar 

from .. import models, schemas
from ..database import get_db
from ..deps import require_role, get_current_user
from .. import auth_utils

router = APIRouter(prefix="/attendance", tags=["attendance"])

# ---------------------------------------------------------
# HELPER: Calculate Month-Accurate Dates
# ---------------------------------------------------------
def add_months(source_date: date, months: int) -> date:
    """
    Smartly adds months to a date. 
    Handles end-of-month edge cases (e.g. Jan 31 + 1 month -> Feb 28/29).
    """
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

def get_current_billing_cycle(join_date: date, report_date: date):
    """
    Calculates the Start and End date for the cycle relevant to 'report_date'.
    Iterates forward from join_date until we bracket the report_date.
    """
    cycle_start = join_date
    cycle_end = add_months(cycle_start, 1)

    # Loop: While the cycle has finished BEFORE today, move to the next cycle.
    # Example: Cycle End Jan 12 <= Report Jan 25? Yes -> Move to Jan 12-Feb 12
    while cycle_end <= report_date:
        cycle_start = cycle_end
        cycle_end = add_months(cycle_start, 1)
        
    return cycle_start, cycle_end

# ---------------------------
# GENERATE REPORT (Excel)
# ---------------------------
@router.get("/report", response_class=StreamingResponse)
def generate_attendance_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Security: Ensure only coaches or admins can download reports
    if current_user.role not in ["coach", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to access reports")

    players = db.query(models.Player).all()
    report_data = []

    today = date.today()

    for player in players:
        join_date = player.created_at.date()
        
        # 1. Calculate the dynamic cycle based on TODAY
        start_date, end_date = get_current_billing_cycle(join_date, today)
        
        # 2. Total Expected Classes
        total_classes_expected = 0
        program_name = player.program or ""
        
        if "3-Day" in program_name:
            total_classes_expected = 12
        elif "5-Day" in program_name:
            total_classes_expected = 20
            
        # 3. Classes Attended (ONLY within this calculated cycle)
        attended_count = 0
        
        for record in player.attendance:
            if record.status: # If Present
                # Check for count in the specific cycle [start_date, end_date)
                if start_date <= record.date < end_date:
                    attended_count += 1

        # 4. Status Logic
        # Rule A: If in First Month -> Always Active
        # Rule B: If in Subsequent Month -> Active ONLY if they have attended classes in this cycle
        
        first_month_end = add_months(join_date, 1)
        
        is_active = "Inactive"
        
        if today < first_month_end:
            is_active = "Active"  # Still in their first month
        elif attended_count > 0:
            is_active = "Active"  # Has attended classes in the current renewed cycle
        else:
            is_active = "Inactive" # Cycle renewed, but no attendance recorded yet
        
        report_data.append({
            "Player Name": player.name,
            "Cycle Start": start_date,
            "Cycle End": end_date,
            "Program": program_name,
            "Total Classes (Cap)": total_classes_expected,
            "Attended (This Cycle)": attended_count,
            "Status": is_active
        })

    # Create DataFrame
    df = pd.DataFrame(report_data)
    
    # Create Excel buffer
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Attendance Report")
    
    buffer.seek(0)
    
    headers = {
        'Content-Disposition': f'attachment; filename="attendance_report_{today}.xlsx"'
    }
    
    return StreamingResponse(buffer, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


# ---------------------------
# GET all players with attendance count
# ---------------------------
@router.get("/", response_model=List[schemas.PlayerOut])
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
            "program": p.program,
            "attendedClasses": attended_count,
        })
    return result


# ---------------------------
# GET attendance for a specific date
# ---------------------------
@router.get("/{day}", response_model=Dict[int, bool])
def get_attendance_for_date(day: date, db: Session = Depends(get_db)):
    """Get attendance status for all players on a specific date"""
    records = (
        db.query(models.Attendance)
        .filter(models.Attendance.date == day)
        .all()
    )
    return {rec.player_id: rec.status for rec in records}


# ---------------------------
# BULK update attendance
# ---------------------------
@router.put("/{day}")
def bulk_update_attendance(day: date, payload: Dict[str, Dict[int, bool]], db: Session = Depends(get_db)):
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