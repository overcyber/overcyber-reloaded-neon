import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = Path(os.environ.get("DATABASE_PATH", str(BASE_DIR / "data" / "overcyber.db")))

# Token secreto de API configurado via env var ou gerado / lido de data/.api_token
TOKEN_FILE = BASE_DIR / "data" / ".api_token"

def get_or_create_token() -> str:
    env_token = os.environ.get("OVERCYBER_API_TOKEN")
    if env_token and env_token.strip():
        return env_token.strip()
    
    if TOKEN_FILE.exists():
        try:
            stored = TOKEN_FILE.read_text(encoding="utf-8").strip()
            if stored:
                return stored
        except Exception:
            pass

    import secrets
    new_token = f"ovc_{secrets.token_urlsafe(32)}"
    try:
        TOKEN_FILE.write_text(new_token, encoding="utf-8")
        TOKEN_FILE.chmod(0o600)
    except Exception:
        pass
    return new_token

API_TOKEN = get_or_create_token()

# CORS: origens permitidas (default: todas ou configurável)
CORS_ORIGINS_RAW = os.environ.get("CORS_ORIGINS", "*")
if CORS_ORIGINS_RAW.strip() == "*":
    CORS_ORIGINS = ["*"]
else:
    CORS_ORIGINS = [orig.strip() for orig in CORS_ORIGINS_RAW.split(",") if orig.strip()]

API_HOST = os.environ.get("API_HOST", "192.168.10.14")
API_PORT = int(os.environ.get("API_PORT", "8800"))

# Documentação Swagger / OpenAPI (habilitada por padrão; pode ser alterada via ENABLE_DOCS=false)
ENABLE_DOCS = os.environ.get("ENABLE_DOCS", "true").lower() in ("true", "1", "yes")
DOCS_URL = "/docs" if ENABLE_DOCS else None
REDOC_URL = "/redoc" if ENABLE_DOCS else None
OPENAPI_URL = "/openapi.json" if ENABLE_DOCS else None

# Tempo máximo de sessão do Admin: 90 minutos (90 * 60 = 5400 segundos)
SESSION_TIMEOUT_MINUTES = int(os.environ.get("SESSION_TIMEOUT_MINUTES", "90"))
SESSION_MAX_AGE_SECONDS = int(os.environ.get("SESSION_MAX_AGE_SECONDS", str(SESSION_TIMEOUT_MINUTES * 60)))


