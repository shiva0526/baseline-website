from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta, datetime
import calendar
import os
import uuid

from .. import models, schemas
from ..database import get_db

# Ensure upload directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "avatars")
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/players", tags=["players"])

# --- Helper Functions ---

def add_months(source_date: date, months: int) -> date:
    """Smartly adds months handling month-end edges"""
    if not source_date:
        source_date = date.today()
    month = source_date.month - 1 + months
    year = source_date.year + month // 12
    month = month % 12 + 1
    day = min(source_date.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)

def get_current_billing_cycle(join_date: date | None, report_date: date):
    """Calculates the start/end of the billing cycle"""
    if not join_date:
        join_date = report_date - timedelta(days=30)
    cycle_start = join_date
    cycle_end = add_months(cycle_start, 1)
    
    count = 0
    while cycle_end <= report_date and count < 120:
        cycle_start = cycle_end
        cycle_end = add_months(cycle_start, 1)
        count += 1
        
    return cycle_start, cycle_end

# --- Endpoints ---

@router.get("/", response_model=List[schemas.PlayerOut])
def list_players(db: Session = Depends(get_db)):
    try:
        players = db.query(models.Player).all()
    except Exception as query_err:
        print(f"Error querying players table: {query_err}")
        import traceback
        traceback.print_exc()
        return []

    result = []
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())

    for p in players:
        try:
            # Handle datetime conversion safely
            raw_join = getattr(p, "joining_date", None) or getattr(p, "created_at", None) or today
            if isinstance(raw_join, datetime):
                join_date = raw_join.date()
            elif isinstance(raw_join, date):
                join_date = raw_join
            else:
                join_date = today

            cycle_start, cycle_end = get_current_billing_cycle(join_date, today)
            
            attended_count_cycle = 0
            weekly_attendance = 0
            
            p_attendance = getattr(p, "attendance", None) or []
            for record in p_attendance:
                if getattr(record, "status", False):
                    rec_date = getattr(record, "date", None)
                    if isinstance(rec_date, datetime):
                        rec_date = rec_date.date()
                    
                    if rec_date:
                        # Monthly Count
                        if cycle_start and cycle_end and cycle_start <= rec_date < cycle_end:
                            attended_count_cycle += 1
                        
                        # Weekly Count
                        if rec_date >= start_of_week:
                            weekly_attendance += 1

            result.append({
                "id": p.id,
                "name": p.name,
                "program": getattr(p, "program", None),
                "batch": getattr(p, "batch", None),
                "phone": getattr(p, "phone", None), 
                "avatar": getattr(p, "avatar", None),
                "gender": getattr(p, "gender", None),
                "age": getattr(p, "age", None),
                "joining_date": getattr(p, "joining_date", None),
                "created_at": getattr(p, "created_at", None),
                "attendedClasses": attended_count_cycle, 
                "weeklyAttendance": weekly_attendance,
                "performance_ratings": getattr(p, "performance_ratings", None) or {}
            })
        except Exception as player_err:
            print(f"Error processing player {getattr(p, 'id', 'unknown')}: {player_err}")
            result.append({
                "id": getattr(p, "id", 0),
                "name": getattr(p, "name", "Unknown"),
                "program": getattr(p, "program", None),
                "batch": getattr(p, "batch", None),
                "phone": getattr(p, "phone", None), 
                "avatar": getattr(p, "avatar", None),
                "gender": getattr(p, "gender", None),
                "age": getattr(p, "age", None),
                "joining_date": getattr(p, "joining_date", None),
                "created_at": getattr(p, "created_at", None),
                "attendedClasses": 0, 
                "weeklyAttendance": 0,
                "performance_ratings": getattr(p, "performance_ratings", None) or {}
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
        "batch": p.batch,
        "phone": p.phone,
        "avatar": p.avatar,
        "gender": p.gender,
        "age": p.age,
        "joining_date": p.joining_date,
        "created_at": p.created_at,
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
    
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    raw_join = getattr(p, "joining_date", None) or getattr(p, "created_at", None) or today
    if isinstance(raw_join, datetime):
        join_date = raw_join.date()
    elif isinstance(raw_join, date):
        join_date = raw_join
    else:
        join_date = today

    cycle_start, cycle_end = get_current_billing_cycle(join_date, today)
    
    attended_count_cycle = 0
    weekly_attendance = 0
    
    for record in getattr(p, "attendance", []) or []:
        if getattr(record, "status", False):
            rec_date = getattr(record, "date", None)
            if isinstance(rec_date, datetime):
                rec_date = rec_date.date()
            if rec_date and cycle_start and cycle_end and (cycle_start <= rec_date < cycle_end):
                attended_count_cycle += 1
            if rec_date and rec_date >= start_of_week:
                weekly_attendance += 1

    return {
        "id": p.id,
        "name": p.name,
        "program": p.program,
        "batch": p.batch,
        "phone": p.phone,
        "avatar": p.avatar,
        "gender": p.gender,
        "age": p.age,
        "joining_date": p.joining_date,
        "created_at": p.created_at,
        "attendedClasses": attended_count_cycle, 
        "weeklyAttendance": weekly_attendance,
        "performance_ratings": p.performance_ratings or {}
    }

# --- UPDATE PLAYER DETAILS ---
@router.put("/{player_id}", response_model=schemas.PlayerOut)
def update_player(player_id: int, payload: schemas.PlayerUpdate, db: Session = Depends(get_db)):
    p = db.query(models.Player).get(player_id)
    if not p:
        raise HTTPException(404, "Player not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(p, key, value)
    
    db.commit()
    db.refresh(p)
    
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    raw_join = getattr(p, "joining_date", None) or getattr(p, "created_at", None) or today
    if isinstance(raw_join, datetime):
        join_date = raw_join.date()
    elif isinstance(raw_join, date):
        join_date = raw_join
    else:
        join_date = today

    cycle_start, cycle_end = get_current_billing_cycle(join_date, today)
    
    attended_count_cycle = 0
    weekly_attendance = 0
    for record in getattr(p, "attendance", []) or []:
        if getattr(record, "status", False):
            rec_date = getattr(record, "date", None)
            if isinstance(rec_date, datetime):
                rec_date = rec_date.date()
            if rec_date and cycle_start and cycle_end and (cycle_start <= rec_date < cycle_end):
                attended_count_cycle += 1
            if rec_date and rec_date >= start_of_week:
                weekly_attendance += 1

    return {
        "id": p.id,
        "name": p.name,
        "program": p.program,
        "batch": p.batch,
        "phone": p.phone,
        "avatar": p.avatar,
        "gender": p.gender,
        "age": p.age,
        "joining_date": p.joining_date,
        "created_at": p.created_at,
        "attendedClasses": attended_count_cycle,
        "weeklyAttendance": weekly_attendance,
        "performance_ratings": p.performance_ratings or {}
    }

# --- AVATAR UPLOAD ---
@router.post("/{player_id}/avatar")
async def upload_avatar(player_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    p = db.query(models.Player).get(player_id)
    if not p:
        raise HTTPException(404, "Player not found")
    
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(400, "Only JPEG, PNG, and WebP images are allowed")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"{player_id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)
    
    # Update player avatar path
    p.avatar = f"/static/avatars/{filename}"
    db.commit()
    
    return {"avatar_url": p.avatar}

@router.delete("/{player_id}", status_code=204)
def delete_player(player_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Player).get(player_id)
    if not p:
        raise HTTPException(404, "Player not found")
    db.delete(p)
    db.commit()
    return None
