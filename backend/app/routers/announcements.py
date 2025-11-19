from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import require_role

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("/", response_model=list[schemas.AnnouncementOut])
def list_active(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    return db.query(models.Announcement).filter(
        (models.Announcement.expires_at.is_(None)) | (models.Announcement.expires_at > now)
    ).order_by(models.Announcement.created_at.desc()).all()


@router.post("/", response_model=schemas.AnnouncementOut, dependencies=[Depends(require_role("coach"))])
def create_announcement(payload: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    a = models.Announcement(**payload.model_dump())
    db.add(a); db.commit(); db.refresh(a)
    return a


@router.delete("/{aid}", dependencies=[Depends(require_role("coach"))])
def delete_announcement(aid: int, db: Session = Depends(get_db)):
    a = db.query(models.Announcement).get(aid)
    if not a:
        raise HTTPException(404, "Announcement not found")
    db.delete(a); db.commit()
    return {"ok": True}
