# judge worker용 SQLAlchemy 모델 (sync 버전)
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models.user import User, CategoryRating
from app.models.problem import Problem
from app.models.test_case import TestCase
from app.models.submission import Submission, UserProblemStat
