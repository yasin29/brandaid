from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    openai_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    openai_chat_model: str = "gemini-3.1-flash-lite"
    openai_embedding_model: str = "gemini-embedding-001"

    frontend_url: str = "http://localhost:5173"

    chroma_db_path: str = "data/chroma_db"
    chroma_collection_name: str = "brand_aid_knowledge"

    class Config:
        # .env lives at the repo root; the backend usually runs from backend/,
        # so check both the cwd and one level up.
        env_file = (".env", "../.env")
        env_file_encoding = "utf-8"


settings = Settings()
