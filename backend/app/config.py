import os
from pydantic_core import to_json

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./civicshield.db")
SECRET_KEY = os.getenv("SECRET_KEY", "civicshield-ai-demo-secret-key-super-secure-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# AI service mode flag
HAS_REAL_AI = bool(GEMINI_API_KEY or OPENAI_API_KEY)
