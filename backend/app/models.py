from datetime import date as dated, datetime
from typing import List, Optional
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="parent") 
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Player(Base):
    __tablename__ = "players"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    program: Mapped[str | None] = mapped_column(String(50), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    avatar: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # --- NEW FIELD: Stores stats like {"Dribbling": 4, "Passing": 3} ---
    performance_ratings: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    # -------------------------------------------------------------------

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    attendance: Mapped[List["Attendance"]] = relationship(back_populates="player", cascade="all, delete-orphan")


class Attendance(Base):
    __tablename__ = "attendance"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), index=True, nullable=False)
    date: Mapped[dated] = mapped_column(Date, index=True, nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, default=False)

    player: Mapped["Player"] = relationship(back_populates="attendance")


class Tournament(Base):
    __tablename__ = "tournaments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)
    location: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    match_type: Mapped[str] = mapped_column(String, nullable=False)
    age_groups: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)
    registration_open: Mapped[str] = mapped_column(String, nullable=False)
    registration_close: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="upcoming")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    registrations: Mapped[List["TournamentRegistration"]] = relationship(
        back_populates="tournament", cascade="all, delete-orphan"
    )

class TournamentRegistration(Base):
    __tablename__ = "tournament_registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id", ondelete="CASCADE"))
    team_name: Mapped[str] = mapped_column(String, nullable=False)
    captain_name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    player_names: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    tournament: Mapped["Tournament"] = relationship(back_populates="registrations")


class Announcement(Base):
    __tablename__ = "announcements"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    jti: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    token_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="refresh_tokens")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)
    coach_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    start_date: Mapped[dated] = mapped_column(Date, nullable=False)
    end_date: Mapped[dated] = mapped_column(Date, nullable=False)

    total_classes: Mapped[int] = mapped_column(Integer, default=0)
    attended_classes: Mapped[int] = mapped_column(Integer, default=0)
    attendance_percentage: Mapped[int] = mapped_column(Integer, default=0)

    coach_feedback: Mapped[dict] = mapped_column(JSON, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    student: Mapped["Player"] = relationship()
    coach: Mapped["User"] = relationship()