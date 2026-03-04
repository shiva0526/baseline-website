from datetime import date as dated, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr

# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class TokenPayload(BaseModel):
    sub: str
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
    model_config = {"from_attributes": True}

# ---------- Players ----------
class PlayerBase(BaseModel):
    name: str
    program: Optional[str] = None
    batch: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    program: Optional[str] = None
    batch: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    avatar: Optional[str] = None

# --- NEW: Schema for saving performance ratings ---
class PlayerPerformanceUpdate(BaseModel):
    ratings: Dict[str, int]  # e.g. {"Dribbling": 5, "Passing": 4}

class PlayerOut(PlayerBase):
    id: int
    name: str
    program: Optional[str] = None
    batch: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    
    # Calculated fields
    attendedClasses: int
    weeklyAttendance: int
    
    # --- NEW: Performance Ratings field ---
    performance_ratings: Optional[Dict[str, int]] = None

    model_config = {"from_attributes": True}

# ---------- Attendance ----------
class AttendanceMark(BaseModel):
    player_id: int
    date: dated
    status: bool

class AttendanceOut(BaseModel):
    id: int
    name: str
    program: Optional[str] = None
    attendedClasses: int
    model_config = {"from_attributes": True}

# ---------- Tournaments ----------
class TournamentBase(BaseModel):
    title: str
    date: str 
    location: Optional[str] = None
    description: Optional[str] = None
    match_type: str = "3v3"
    age_groups: Optional[List[str]] = None
    registration_open: Optional[str] = None
    registration_close: Optional[str] = None

class TournamentCreate(TournamentBase):
    pass

class TournamentUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    match_type: Optional[str] = None
    age_groups: Optional[List[str]] = None
    registration_open: Optional[str] = None
    registration_close: Optional[str] = None
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

# ---------- Other ----------
class RefreshTokenOut(BaseModel):
    id: int
    jti: str
    user_id: int
    expires_at: datetime
    revoked: bool
    model_config = {"from_attributes": True}

class ReportCreate(BaseModel):
    student_id: int
    start_date: dated
    end_date: dated
    feedback: dict 

class ReportOut(BaseModel):
    id: int
    student_id: int
    coach_id: int
    attendance_percentage: int
    created_at: datetime
    model_config = {"from_attributes": True}