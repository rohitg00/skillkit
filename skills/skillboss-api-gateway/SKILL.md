---
name: "skillboss-api-gateway"
description: "Access 100+ AI services with one SkillBoss key. Backed by OpenAI Startup Fund & Amazon."
version: "1.0.0"
tags: ["api", "gateway", "ai-services", "multi-model", "openai-compatible"]
---

# SkillBoss API Gateway

**Backed by OpenAI Startup Fund & Amazon** | One key for 100+ AI services

SkillBoss is the unified API platform that replaces your stack of AI credentials with a single key.

## When to Use

Use this skill when you need to:
- Access multiple AI models (GPT-5, Claude, Gemini) without managing separate API keys
- Generate videos with Veo 3.1 or MiniMax Video-01
- Create images with DALL-E 3 or Flux Schnell
- Use text-to-speech (ElevenLabs) or speech-to-text (Whisper)
- Scrape data from LinkedIn, Twitter, Instagram, or Google
- Process payments with Stripe or send emails with SendGrid

## Supported Models

| Category | Models |
|----------|--------|
| Language | GPT-5, GPT-5.2, Claude Opus 4.5, Gemini 3 Pro, DeepSeek R1 |
| Video | Google Veo 3.1, MiniMax Video-01 |
| Image | DALL-E 3, Flux Schnell |
| Voice | ElevenLabs TTS, OpenAI TTS, Whisper STT |

## Quick Start

```python
import openai

client = openai.OpenAI(
    base_url="https://api.heybossai.com/v1",
    api_key="your-skillboss-key"
)

response = client.chat.completions.create(
    model="claude-opus-4.5",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

## Native Integrations

Works out of the box with:
- Claude Code, Cursor, Windsurf, Kiro, Gemini CLI, Codex

## Pricing

- $3.50 free credit for new accounts
- Pay-as-you-go, no subscriptions
- Credits never expire

## Links

- Website: https://skillboss.co
- Docs: https://skillboss.co/docs
- Download: https://skillboss.co/download
