"""Add TestReferenceRange model

Revision ID: 553e601f77f5
Revises: e9aa3b090ca8
Create Date: 2025-06-29 23:12:25.972482

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '553e601f77f5'
down_revision = 'e9aa3b090ca8'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table("lab_tests") as batch_op:
        batch_op.add_column(sa.Column('parameter', sa.String(length=100), nullable=False, server_default="Pending"))

    op.create_table('test_reference_ranges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('parameter', sa.String(length=100), nullable=False),
        sa.Column('normal_min', sa.Float(), nullable=False),
        sa.Column('normal_max', sa.Float(), nullable=False),
        sa.Column('units', sa.String(length=50), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    with op.batch_alter_table("lab_tests") as batch_op:
        batch_op.drop_column('parameter')
    op.drop_table('test_reference_ranges')