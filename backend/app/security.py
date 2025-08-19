from __future__ import annotations

import base64
import os
from cryptography.fernet import Fernet, InvalidToken


def _load_key() -> bytes:
    key_b64 = os.environ.get("PAN_AADHAAR_ENC_KEY")
    if key_b64:
        try:
            # Accept both urlsafe base64 or raw 32-byte base64 per Fernet
            base64.urlsafe_b64decode(key_b64)
            return key_b64.encode()
        except Exception:
            pass
    # Generate ephemeral key if not provided; NOT for production
    key = Fernet.generate_key()
    os.environ["PAN_AADHAAR_ENC_KEY"] = key.decode()
    return key


_FERNET = Fernet(_load_key())


def encrypt_sensitive(value: str | None) -> str | None:
    if not value:
        return value
    token = _FERNET.encrypt(value.encode("utf-8"))
    return token.decode("utf-8")


def decrypt_sensitive(token: str | None) -> str | None:
    if not token:
        return token
    try:
        return _FERNET.decrypt(token.encode("utf-8")).decode("utf-8")
    except InvalidToken:
        return None


