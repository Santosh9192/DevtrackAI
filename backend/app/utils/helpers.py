import os
import uuid
from datetime import datetime, date
from typing import Optional


def generate_unique_filename(original_filename: str) -> str:
    ext = os.path.splitext(original_filename)[1]
    return f"{uuid.uuid4()}{ext}"


def validate_file_size(file_size: int, max_size: int = 5 * 1024 * 1024) -> bool:
    return file_size <= max_size


def is_overdue(deadline: Optional[date]) -> bool:
    if not deadline:
        return False
    return deadline < date.today()


def calculate_progress(total: int, completed: int) -> float:
    if total == 0:
        return 0.0
    return round((completed / total) * 100, 1)
