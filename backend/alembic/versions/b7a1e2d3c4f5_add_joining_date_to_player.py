"""add joining_date to player

Revision ID: b7a1e2d3c4f5
Revises: f63a80fe79d2
Create Date: 2026-03-20 23:28:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b7a1e2d3c4f5'
down_revision = 'a018f34c26a9'
branch_labels = None
depends_on = None


def upgrade():
    # Add joining_date column to players table
    op.add_column('players', sa.Column('joining_date', sa.Date(), nullable=True))


def downgrade():
    # Remove joining_date column from players table
    op.drop_column('players', 'joining_date')
