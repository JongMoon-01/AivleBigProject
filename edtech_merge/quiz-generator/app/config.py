import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    CHROMADB_HOST: str = os.getenv("CHROMADB_HOST", "localhost")
    CHROMADB_PORT: int = int(os.getenv("CHROMADB_PORT", "8000"))
    APP_PORT: int = int(os.getenv("APP_PORT", "8082"))
    
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-ada-002"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 1000
    
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    
    COLLECTION_NAME: str = "edtech-quiz"
    
    TXT_DIR: str = "resources/txt"

settings = Settings()