import os
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
