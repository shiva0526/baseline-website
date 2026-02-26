from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta, datetime
import calendar

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/players", tags=["players"])

# --- Helper Functions ---

def add_months(source_date: date, months: int) -> date:
    """Smartly adds months handling month-end edges"""
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

def get_current_billing_cycle(join_date: date, report_date: date):
    """Calculates the start/end of the billing cycle"""
    cycle_start = join_date
    cycle_end = add_months(cycle_start, 1)
    
    while cycle_end <= report_date:
        cycle_start = cycle_end
        cycle_end = add_months(cycle_start, 1)
        
    return cycle_start, cycle_end

# --- Endpoints ---

@router.get("/", response_model=List[schemas.PlayerOut])
def list_players(db: Session = Depends(get_db)):
    players = db.query(models.Player).all()
    result = []
    
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())

    for p in players:
        # Handle datetime conversion
        join_date = p.created_at
        if isinstance(join_date, datetime):
            join_date = join_date.date()
            
        cycle_start, cycle_end = get_current_billing_cycle(join_date, today)
        
        attended_count_cycle = 0
        weekly_attendance = 0
        
        for record in p.attendance:
            if record.status:
                rec_date = record.date
                if isinstance(rec_date, datetime):
                    rec_date = rec_date.date()
                
                # Monthly Count
                if cycle_start <= rec_date < cycle_end:
                    attended_count_cycle += 1
                
                # Weekly Count
                if rec_date >= start_of_week:
                    weekly_attendance += 1

        result.append({
            "id": p.id,
            "name": p.name,
            "program": p.program,
            "phone": p.phone, 
            "avatar": p.avatar, 
            "attendedClasses": attended_count_cycle, 
            "weeklyAttendance": weekly_attendance,
            # --- NEW: Return ratings so they show up in the profile ---
            "performance_ratings": p.performance_ratings or {}
        })
    
    return result

@router.post("/", response_model=schemas.PlayerOut)
def create_player(payload: schemas.PlayerCreate, db: Session = Depends(get_db)):
    p = models.Player(**payload.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)

    return {
        "id": p.id,
        "name": p.name,
        "program": p.program,
        "phone": p.phone,
        "avatar": p.avatar,
        "attendedClasses": 0,
        "weeklyAttendance": 0,
        "performance_ratings": {}
    }

# --- NEW ENDPOINT: Save Performance Ratings ---
@router.put("/{player_id}/performance", response_model=schemas.PlayerOut)
def update_performance(player_id: int, payload: schemas.PlayerPerformanceUpdate, db: Session = Depends(get_db)):
    p = db.query(models.Player).get(player_id)
    if not p:
        raise HTTPException(404, "Player not found")
    
    # Save the ratings JSON to the database
    p.performance_ratings = payload.ratings
    db.commit()
    db.refresh(p)
    
    # Recalculate attendance stats for the response (reusing logic for accuracy)
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    join_date = p.created_at
    if isinstance(join_date, datetime):
        join_date = join_date.date()
    cycle_start, cycle_end = get_current_billing_cycle(join_date, today)
    
    attended_count_cycle = 0
    weekly_attendance = 0
    
    for record in p.attendance:
        if record.status:
            rec_date = record.date
            if isinstance(rec_date, datetime):
                rec_date = rec_date.date()
            if cycle_start <= rec_date < cycle_end:
                attended_count_cycle += 1
            if rec_date >= start_of_week:
                weekly_attendance += 1

    return {
        "id": p.id,
        "name": p.name,
        "program": p.program,
        "phone": p.phone,
        "avatar": p.avatar,
        "attendedClasses": attended_count_cycle, 
        "weeklyAttendance": weekly_attendance,
        "performance_ratings": p.performance_ratings
    }

@router.delete("/{player_id}", status_code=204)
def delete_player(player_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Player).get(player_id)
    if not p:
        raise HTTPException(404, "Player not found")
    db.delete(p)
    db.commit()
    return None