import secrets
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import API_TOKEN
from . import db

security = HTTPBearer(auto_error=False)

def verify_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security)
) -> str:
    """Verifica se a requisição possui Bearer token válido ou cookie de sessão de admin."""
    # 1. Bearer Token
    if credentials and credentials.credentials:
        if secrets.compare_digest(credentials.credentials, API_TOKEN):
            return credentials.credentials
        user = db.get_session_user(credentials.credentials)
        if user:
            return f"user:{user['id']}"

    # 2. Cookie de sessão 'sid'
    sid = request.cookies.get("sid")
    if sid:
        user = db.get_session_user(sid)
        if user:
            return f"user:{user['id']}"

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Autenticação necessária (Bearer token ou sessão ativa)",
        headers={"WWW-Authenticate": "Bearer"},
    )

def optional_verify_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security)
) -> str | None:
    try:
        return verify_token(request, credentials)
    except HTTPException:
        return None

