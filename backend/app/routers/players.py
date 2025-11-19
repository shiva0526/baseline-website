from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import require_role

router = APIRouter(prefix="/players", tags=["players"])


@router.get("/", response_model=list[schemas.PlayerOut])
def list_players(db: Session = Depends(get_db)):
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
    # print(result)
    return result



@router.post("/", response_model=schemas.PlayerOut)
def create_player(payload: schemas.PlayerCreate, db: Session = Depends(get_db)):
    p = models.Player(**payload.model_dump())
    db.add(p); db.commit(); db.refresh(p)

    # new players always start with 0 attendance
    return {
        "id": p.id,
        "name": p.name,
        "program": p.program,
        "attendedClasses": 0
    }


# @router.get("/{player_id}", response_model=schemas.PlayerOut)
# def get_player(player_id: int, db: Session = Depends(get_db)):
#     p = db.query(models.Player).get(player_id)
#     if not p:
#         raise HTTPException(404, "Player not found")
#     return p


# @router.put("/{player_id}", response_model=schemas.PlayerOut, dependencies=[Depends(require_role("coach"))])
# def update_player(player_id: int, payload: schemas.PlayerUpdate, db: Session = Depends(get_db)):
#     p = db.query(models.Player).get(player_id)
#     if not p:
#         raise HTTPException(404, "Player not found")
#     for k, v in payload.model_dump(exclude_unset=True).items():
#         setattr(p, k, v)
#     db.commit(); db.refresh(p)
#     return p


@router.delete("/{player_id}", status_code=204)
def delete_player(player_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Player).get(player_id)
    if not p:
        raise HTTPException(404, "Player not found")
    db.delete(p)
    db.commit()
    return None  # 204 means no response body
