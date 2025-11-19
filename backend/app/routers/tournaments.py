from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import require_role

router = APIRouter(prefix="/tournaments", tags=["tournaments"])

@router.post("/", response_model=schemas.TournamentOut)
def create_tournament(payload: schemas.TournamentCreate, db: Session = Depends(get_db)):
    t = models.Tournament(**payload.dict())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

@router.get("/", response_model=list[schemas.TournamentOut])
def list_tournaments(db: Session = Depends(get_db)):
    return db.query(models.Tournament).order_by(models.Tournament.date).all()

@router.get("/{tournament_id}", response_model=schemas.TournamentOut)
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    t = db.query(models.Tournament).get(tournament_id)
    if not t:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return t

@router.put("/{tournament_id}/cancel")
def cancel_tournament(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(models.Tournament).get(tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Update tournament status to cancelled
    tournament.status = "cancelled"
    db.commit()
    db.refresh(tournament)
    return tournament
