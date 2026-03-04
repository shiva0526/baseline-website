from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user 
from ..services import pdf_service

router = APIRouter(prefix="/reports", tags=["reports"])

# --- HELPER: DEFINE YOUR SCHEDULE RULES HERE ---
def get_program_frequency(program_name: str | None) -> int:
    """
    Returns the expected sessions per week based on the program name.
    """
    if not program_name:
        return 3 # Default fallback if no program is assigned

    name = program_name.lower().strip()
    
    # LOGIC: Look for keywords or exact matches
    if "2 day" in name or "2 days" in name: return 2
    if "3 day" in name or "3 days" in name: return 3
    if "4 day" in name or "4 days" in name: return 4
    if "5 day" in name or "5 days" in name: return 5
    if "elite" in name: return 5   # Example: Elite players expected 5 days
    if "beginner" in name: return 2 # Example: Beginners expected 2 days
    
    return 3 # Default standard

@router.post("/generate")
def generate_report(
    payload: schemas.ReportCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify Role
    if current_user.role not in ["coach", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # 2. Fetch Player
    player = db.query(models.Player).filter(models.Player.id == payload.student_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    print(f"DEBUG: Generating Report for {player.name} ({player.program})")
    print(f"DEBUG: Range {payload.start_date} to {payload.end_date}")

    # ==================================================================
    # 3. Calculate Statistics (QUOTA LOGIC)
    # ==================================================================

    # A. Calculate Duration (How many weeks?)
    total_days = (payload.end_date - payload.start_date).days + 1
    number_of_weeks = total_days / 7.0
    
    # B. Get Expected Frequency (Sessions Per Week)
    weekly_freq = get_program_frequency(player.program)
    
    # C. Calculate "Total Expected Classes" (The Quota)
    total_expected = int(round(number_of_weeks * weekly_freq))

    # D. Count ACTUAL Attendance
    attended = db.query(models.Attendance).filter(
        models.Attendance.player_id == player.id,
        models.Attendance.date >= payload.start_date,
        models.Attendance.date <= payload.end_date,
        models.Attendance.status == True
    ).count()

    # E. Percentage
    percentage = int((attended / total_expected * 100)) if total_expected > 0 else 0
    
    print(f"DEBUG: Duration: {total_days} days ({number_of_weeks:.1f} weeks)")
    print(f"DEBUG: Frequency: {weekly_freq} sessions/week")
    print(f"DEBUG: Quota (Target): {total_expected} classes")
    print(f"DEBUG: Actual: {attended} classes")
    print(f"DEBUG: Result: {percentage}%")



    # ==================================================================
    # 4. Save & Generate PDF
    # ==================================================================

    new_report = models.Report(
        student_id=player.id,
        coach_id=current_user.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        total_classes=total_expected,    # Storing the Target Quota
        attended_classes=attended,
        attendance_percentage=percentage,
        coach_feedback=payload.feedback
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    pdf_data = {
        "player_name": player.name,
        "program": player.program or "Standard",
        "coach_name": current_user.email, 
        "date_range": f"{payload.start_date.strftime('%b %d')} - {payload.end_date.strftime('%b %d, %Y')}",
        "total_classes": total_expected, 
        "attended_classes": attended,
        "attendance_percentage": percentage,
        "feedback": payload.feedback,
        "generated_at": datetime.now().strftime("%Y-%m-%d"),
    }

    try:
        pdf_bytes = pdf_service.generate_report_pdf(pdf_data)
    except Exception as e:
        print(f"ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"PDF Error: {str(e)}")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Report_{player.name}_{payload.end_date}.pdf"
        }
    )