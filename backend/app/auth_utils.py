# (JWT + hashing)

from datetime import datetime, timedelta,timezone
from typing import Optional,Dict
from jose import jwt, JWTError
from passlib.context import CryptContext
from .config import settings

from uuid import uuid4
from .config import settings
import hashlib


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# settings = get_settings()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _now_utc():
    return datetime.now(timezone.utc)

def create_access_token(data: Dict, expires_minutes: int | None = None) -> str:
    to_encode = data.copy()
    expire = _now_utc() + timedelta(minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data: Dict, expires_days: int | None = None) -> Dict[str, str]:
    # returns { "token": str, "jti": str, "expires_at": datetime }
    jti = str(uuid4())
    to_encode = data.copy()
    expire = _now_utc() + timedelta(days=expires_days or settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh", "jti": jti})
    token = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return {"token": token, "jti": jti, "expires_at": expire}


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None

def hash_token_for_db(token: str) -> str:
    # store hashed refresh token in DB for safety
    return hashlib.sha256(token.encode("utf-8")).hexdigest()