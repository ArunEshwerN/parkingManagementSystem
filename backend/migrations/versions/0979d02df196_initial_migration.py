"""Initial migration

Revision ID: 0979d02df196
Revises: 
Create Date: 2024-10-12 17:16:46.876631

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0979d02df196'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_admin', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('is_admin')

    # ### end Alembic commands ###
