from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import require_role

router = APIRouter(prefix="/registrations", tags=["registrations"])

@router.post("/{tournament_id}", response_model=schemas.RegistrationOut)
def register_team(tournament_id: int, payload: schemas.RegistrationCreate, db: Session = Depends(get_db)):
    t = db.query(models.Tournament).get(tournament_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")

    reg = models.TournamentRegistration(
        tournament_id=t.id,
        team_name=payload.team_name,
        captain_name=payload.captain_name,
        phone=payload.phone,
        email=payload.email,
        player_names=payload.player_names,
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg

@router.get("/{tournament_id}", response_model=list[schemas.RegistrationOut])
def list_registrations(tournament_id: int, db: Session = Depends(get_db)):
    t = db.query(models.Tournament).get(tournament_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    registrations = db.query(models.TournamentRegistration).filter_by(tournament_id=t.id).all()
    
    # Validate that all required fields are present
    for reg in registrations:
        if not all([reg.team_name, reg.captain_name, reg.phone, reg.email]):
            print(f"Warning: Registration {reg.id} has missing required fields")
    
    return registrations
