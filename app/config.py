from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_key: str = "changeme"
    cache_dir: Path = Path("cache")
    output_dir: Path = Path("output")
    host: str = "0.0.0.0"
    port: int = 8000
    base_url: str = "http://localhost:8000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    def model_post_init(self, __context) -> None:
        self.cache_dir = self.cache_dir.resolve()
        self.output_dir = self.output_dir.resolve()
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.output_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()
