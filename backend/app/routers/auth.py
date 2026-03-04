# auth.py (replace)
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from ..database import get_db
from .. import models, schemas
from ..auth_utils import verify_password, create_access_token, create_refresh_token, hash_token_for_db, decode_token, hash_password
from datetime import timedelta
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserOut)
def register(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = models.User(
        email=data.email,
        hashed_password=hash_password(data.password),
        role="coach",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=schemas.Token)
def login(response: Response, form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    # payload for tokens
    payload = {"sub": user.email, "role": user.role, "user_id": user.id}

    access_token = create_access_token(payload)
    refresh_meta = create_refresh_token(payload)  # { token, jti, expires_at }
    refresh_token = refresh_meta["token"]

    # store refresh token in DB (hash for safety)
    token_hash = hash_token_for_db(refresh_token)
    db_token = models.RefreshToken(
        jti=refresh_meta["jti"],
        token_hash=token_hash,
        user_id=user.id,
        expires_at=refresh_meta["expires_at"]
    )
    db.add(db_token)
    db.commit()

    # Set cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE_DAYS,
        path="/auth/refresh"
    )

    return {"access_token": access_token, "role": user.role, "token_type": "bearer"}


@router.post("/refresh", response_model=schemas.Token)
def refresh(response: Response, refresh_token: str | None = Cookie(None), db: Session = Depends(get_db)):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token provided")
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh" or "jti" not in payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    jti = payload["jti"]

    # find in DB
    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.jti == jti).first()
    if not db_token or db_token.revoked:
        raise HTTPException(status_code=401, detail="Refresh token revoked or not found")
    # optional: check token_hash matches
    # hashed = hash_token_for_db(refresh_token)
    # if db_token.token_hash != hashed: raise HTTPException(...)

    # issue new tokens (rotation optional - here we rotate)
    user = db.query(models.User).filter(models.User.id == db_token.user_id).first()
    payload_user = {"sub": user.email, "role": user.role, "user_id": user.id}

    # Invalidate old refresh token (rotate)
    db_token.revoked = True

    new_refresh_meta = create_refresh_token(payload_user)
    new_refresh_token = new_refresh_meta["token"]
    new_hash = hash_token_for_db(new_refresh_token)
    new_db_token = models.RefreshToken(
        jti=new_refresh_meta["jti"],
        token_hash=new_hash,
        user_id=user.id,
        expires_at=new_refresh_meta["expires_at"]
    )
    db.add(new_db_token)
    db.commit()

    new_access = create_access_token(payload_user)
    # set cookies
    response.set_cookie("access_token", new_access, httponly=True, secure=True, samesite="none",
                        max_age=60 * settings.ACCESS_TOKEN_EXPIRE_MINUTES, path="/")
    response.set_cookie("refresh_token", new_refresh_token, httponly=True, secure=True, samesite="none",
                        max_age=60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE_DAYS, path="/auth/refresh")
    return {"access_token": new_access, "role": user.role, "token_type": "bearer"}


@router.post("/logout")
def logout(response: Response, refresh_token: str | None = Cookie(None), db: Session = Depends(get_db)):
    # revoke refresh token if present
    if refresh_token:
        payload = decode_token(refresh_token)
        if payload and payload.get("type") == "refresh" and "jti" in payload:
            jti = payload["jti"]
            db_token = db.query(models.RefreshToken).filter(models.RefreshToken.jti == jti).first()
            if db_token:
                db_token.revoked = True
                db.commit()

    # clear cookies
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/auth/refresh")
    return {"ok": True}
