from datetime import date as dated, datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

# Payload structure stored inside JWTs
class TokenPayload(BaseModel):
    sub: str                 # usually the user's email or username
    user_id: Optional[int] = None
    role: Optional[str] = None
    exp: Optional[int] = None
    jti: Optional[str] = None
    type: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------- Users ----------
class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    created_at: datetime

    # Pydantic v2: read attributes from ORM objects
    model_config = {"from_attributes": True}


# ---------- Players ----------
class PlayerBase(BaseModel):
    name: str
    program: Optional[str] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    program: Optional[str] = None
    age: Optional[int] = None

class PlayerOut(PlayerBase):
    id: int
    name: str
    program: Optional[str] = None
    # if your DB stores `attended_classes` (snake_case), either
    #  - add a property `attendedClasses` on the SQLAlchemy model, OR
    #  - use alias (see commented example below).
    attendedClasses: int

    model_config = {"from_attributes": True}


# ---------- Attendance ----------
class AttendanceMark(BaseModel):
    player_id: int
    date: dated
    status: bool    # boolean (True/False) — keep this as bool

class AttendanceOut(BaseModel):
    id: int
    name: str
    program: Optional[str] = None
    attendedClasses: int

    model_config = {"from_attributes": True}


# ---------- Tournaments ----------
class TournamentBase(BaseModel):
    title: str
    date: dated
    location: Optional[str] = None
    description: Optional[str] = None
    match_type: str = "3v3"
    age_groups: Optional[List[str]] = None
    registration_open: Optional[dated] = None
    registration_close: Optional[dated] = None

class TournamentCreate(TournamentBase):
    pass

class TournamentUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[dated] = None
    location: Optional[str] = None
    description: Optional[str] = None
    match_type: Optional[str] = None
    age_groups: Optional[List[str]] = None
    registration_open: Optional[dated] = None
    registration_close: Optional[dated] = None
    required_fields: Optional[List[str]] = None

class TournamentOut(TournamentBase):
    id: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------- Registrations ----------
class RegistrationCreate(BaseModel):
    team_name: str
    captain_name: str
    phone: str
    email: str
    player_names: List[str]

class RegistrationOut(BaseModel):
    id: int
    tournament_id: int
    team_name: str
    captain_name: str
    phone: str
    email: str
    player_names: List[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------- Refresh token (optional) ----------
class RefreshTokenOut(BaseModel):
    id: int
    jti: str
    user_id: int
    expires_at: datetime
    revoked: bool

    model_config = {"from_attributes": True}


# ---------- Announcements ----------
class AnnouncementCreate(BaseModel):
    message: str
    expires_at: Optional[datetime] = None

class AnnouncementOut(BaseModel):
    id: int
    message: str
    expires_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
