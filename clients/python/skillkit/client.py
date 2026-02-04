from __future__ import annotations

from typing import Optional
from urllib.parse import quote

import httpx

from skillkit.models import (
    CacheStats,
    CategoriesResponse,
    Category,
    HealthResponse,
    SearchResponse,
    Skill,
    TrendingResponse,
)


class SkillKitClient:
    def __init__(self, base_url: str = "http://localhost:3737", timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self) -> "SkillKitClient":
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout)
        return self

    async def __aexit__(self, *args: object) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(base_url=self.base_url, timeout=self.timeout)
        return self._client

    async def health(self) -> HealthResponse:
        client = self._get_client()
        response = await client.get("/health")
        response.raise_for_status()
        data = response.json()
        return HealthResponse(
            status=data["status"],
            version=data["version"],
            skill_count=data.get("skillCount", 0),
            uptime=data.get("uptime", 0),
        )

    async def search(
        self,
        query: str,
        limit: int = 20,
        include_content: bool = False,
    ) -> SearchResponse:
        client = self._get_client()
        params = {"q": query, "limit": str(limit)}
        if include_content:
            params["include_content"] = "true"
        response = await client.get("/search", params=params)
        response.raise_for_status()
        data = response.json()
        return SearchResponse(
            skills=[Skill(**s) for s in data["skills"]],
            total=data["total"],
            query=data["query"],
            limit=data["limit"],
        )

    async def search_with_filters(
        self,
        query: str,
        limit: int = 20,
        include_content: bool = False,
        tags: Optional[list[str]] = None,
        category: Optional[str] = None,
        source: Optional[str] = None,
    ) -> SearchResponse:
        client = self._get_client()
        body: dict = {"query": query, "limit": limit, "include_content": include_content}
        filters: dict = {}
        if tags:
            filters["tags"] = tags
        if category:
            filters["category"] = category
        if source:
            filters["source"] = source
        if filters:
            body["filters"] = filters
        response = await client.post("/search", json=body)
        response.raise_for_status()
        data = response.json()
        return SearchResponse(
            skills=[Skill(**s) for s in data["skills"]],
            total=data["total"],
            query=data["query"],
            limit=data["limit"],
        )

    async def get_skill(self, source: str, skill_id: str) -> Skill:
        client = self._get_client()
        response = await client.get(f"/skills/{quote(source, safe='')}/{quote(skill_id, safe='')}")
        response.raise_for_status()
        return Skill(**response.json())

    async def trending(self, limit: int = 20) -> list[Skill]:
        client = self._get_client()
        response = await client.get("/trending", params={"limit": str(limit)})
        response.raise_for_status()
        data = response.json()
        return [Skill(**s) for s in data["skills"]]

    async def categories(self) -> list[Category]:
        client = self._get_client()
        response = await client.get("/categories")
        response.raise_for_status()
        data = response.json()
        return [Category(**c) for c in data["categories"]]

    async def cache_stats(self) -> CacheStats:
        client = self._get_client()
        response = await client.get("/cache/stats")
        response.raise_for_status()
        data = response.json()
        return CacheStats(
            hits=data["hits"],
            misses=data["misses"],
            size=data["size"],
            max_size=data.get("maxSize", 0),
            hit_rate=data.get("hitRate", 0.0),
        )

    async def close(self) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None
