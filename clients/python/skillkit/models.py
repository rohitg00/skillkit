from typing import Optional
from pydantic import BaseModel


class Skill(BaseModel):
    name: str
    description: Optional[str] = None
    source: str
    repo: Optional[str] = None
    tags: Optional[list[str]] = None
    category: Optional[str] = None
    content: Optional[str] = None
    stars: Optional[int] = None
    installs: Optional[int] = None


class SearchResponse(BaseModel):
    skills: list[Skill]
    total: int
    query: str
    limit: int


class HealthResponse(BaseModel):
    status: str
    version: str
    skill_count: int = 0
    uptime: int = 0


class CacheStats(BaseModel):
    hits: int
    misses: int
    size: int
    max_size: int = 0
    hit_rate: float = 0.0


class Category(BaseModel):
    name: str
    count: int


class CategoriesResponse(BaseModel):
    categories: list[Category]
    total: int


class TrendingResponse(BaseModel):
    skills: list[Skill]
    limit: int
