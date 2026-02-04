import pytest
import httpx
import respx

from skillkit import SkillKitClient


BASE_URL = "http://localhost:3737"


@pytest.fixture
def mock_api():
    with respx.mock(base_url=BASE_URL) as respx_mock:
        yield respx_mock


@pytest.mark.asyncio
async def test_health(mock_api):
    mock_api.get("/health").respond(
        json={"status": "ok", "version": "1.11.0", "skillCount": 100, "uptime": 60}
    )
    async with SkillKitClient(BASE_URL) as client:
        health = await client.health()
        assert health.status == "ok"
        assert health.version == "1.11.0"
        assert health.skill_count == 100


@pytest.mark.asyncio
async def test_search(mock_api):
    mock_api.get("/search").respond(
        json={
            "skills": [{"name": "react-perf", "source": "owner/repo"}],
            "total": 1,
            "query": "react",
            "limit": 20,
        }
    )
    async with SkillKitClient(BASE_URL) as client:
        result = await client.search("react")
        assert result.total == 1
        assert result.skills[0].name == "react-perf"


@pytest.mark.asyncio
async def test_search_with_filters(mock_api):
    mock_api.post("/search").respond(
        json={
            "skills": [{"name": "nextjs-auth", "source": "other/repo"}],
            "total": 1,
            "query": "auth",
            "limit": 20,
        }
    )
    async with SkillKitClient(BASE_URL) as client:
        result = await client.search_with_filters("auth", tags=["nextjs"])
        assert result.total == 1


@pytest.mark.asyncio
async def test_get_skill(mock_api):
    mock_api.get("/skills/owner/repo/react-perf").respond(
        json={"name": "react-perf", "description": "React performance", "source": "owner/repo"}
    )
    async with SkillKitClient(BASE_URL) as client:
        skill = await client.get_skill("owner/repo", "react-perf")
        assert skill.name == "react-perf"


@pytest.mark.asyncio
async def test_trending(mock_api):
    mock_api.get("/trending").respond(
        json={"skills": [{"name": "a", "source": "x/y"}], "limit": 20}
    )
    async with SkillKitClient(BASE_URL) as client:
        trending = await client.trending()
        assert len(trending) == 1


@pytest.mark.asyncio
async def test_categories(mock_api):
    mock_api.get("/categories").respond(
        json={"categories": [{"name": "react", "count": 5}], "total": 1}
    )
    async with SkillKitClient(BASE_URL) as client:
        cats = await client.categories()
        assert len(cats) == 1
        assert cats[0].name == "react"


@pytest.mark.asyncio
async def test_cache_stats(mock_api):
    mock_api.get("/cache/stats").respond(
        json={"hits": 10, "misses": 5, "size": 8, "maxSize": 500, "hitRate": 0.667}
    )
    async with SkillKitClient(BASE_URL) as client:
        stats = await client.cache_stats()
        assert stats.hits == 10
        assert stats.size == 8
