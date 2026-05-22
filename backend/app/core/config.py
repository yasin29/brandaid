from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    openai_chat_model: str = "gpt-5.4-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    frontend_url: str = "http://localhost:5173"

    chroma_db_path: str = "data/chroma_db"
    chroma_collection_name: str = "brand_aid_knowledge"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
