from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import API_TOKEN

security = HTTPBearer(auto_error=False)

def verify_token(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> str:
    """Verifica se o header Authorization: Bearer <TOKEN> corresponde ao API_TOKEN."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Header Authorization com Bearer token ausente",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Comparação em tempo constante
    import secrets
    if not secrets.compare_digest(credentials.credentials, API_TOKEN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token de acesso inválido ou expirado",
        )
    
    return credentials.credentials
