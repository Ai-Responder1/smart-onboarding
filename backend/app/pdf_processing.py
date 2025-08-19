from __future__ import annotations

from typing import List, Tuple
import os
from pathlib import Path

from PyPDF2 import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    texts: List[str] = []
    for page in reader.pages:
        try:
            texts.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n".join(texts)


def validate_pdf(file_name: str, file_size: int) -> Tuple[bool, str]:
    if not file_name.lower().endswith(".pdf"):
        return False, "Only PDF files are allowed"
    max_size = 10 * 1024 * 1024
    if file_size > max_size:
        return False, "File exceeds 10MB limit"
    return True, ""


def save_upload_to_disk(upload_dir: str, filename: str, data: bytes) -> str:
    Path(upload_dir).mkdir(parents=True, exist_ok=True)
    save_path = os.path.join(upload_dir, filename)
    with open(save_path, "wb") as f:
        f.write(data)
    return save_path


