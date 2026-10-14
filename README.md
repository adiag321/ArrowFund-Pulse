# ArrowFund Pulse

Automated Private Equity and Venture Capital news aggregator. A scheduled job fetches articles from the sources below, dedupes and tags them, and a Next.js frontend renders them in a filterable feed — no database, just static JSON on Vercel Blob.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the site. It reads from `data/news-data.json` locally (falls back to Vercel Blob in production).

To pull fresh articles locally:

```bash
npm run fetch:news
```

## Environment variables

Create a `.env.local` (see `.env.local.example`):

| Variable | Required for | Notes |
|---|---|---|
| `GNEWS_API_KEY` | GNews API fetching | Free tier, 100 req/day — [gnews.io](https://gnews.io/) |
| `NYT_API_KEY` | NYT Article Search fetching | Free tier, 500 req/day / 5 req/min — [developer.nytimes.com](https://developer.nytimes.com/) |
| `CRON_SECRET` | Production only | Authenticates the scheduled cron request to `/api/cron/fetch-news` |
| `BLOB_READ_WRITE_TOKEN` | Production only | Auto-set by Vercel when a Blob store is connected to the project |

## News sources

| Source | Type | Cost | Coverage |
|---|---|---|---|
| GNews API | API | Free (100 req/day) | General PE + VC news search |
| NYT Article Search | API | Free (500 req/day) | DealBook / business coverage |
| Yahoo Finance | RSS | Free | Headlines for public PE/alt-asset managers (KKR, Blackstone, Apollo, Carlyle, Ares, Blue Owl, TPG) |
| PE Hub | RSS | Free | PE deal news |
| Private Equity Wire | RSS | Free | PE/private markets news |
| TechCrunch (Venture) | RSS | Free | Startup/VC news |
| CNBC | RSS | Free | Finance + Business sections |
| WSJ | RSS | Free | Markets + US Business sections (headline/snippet only — full articles are paywalled) |
| VC News Daily | RSS | Free | Daily VC financing roundup |

**Not included:** PitchBook has no free tier at any price point (enterprise-only, sales-negotiated). Crunchbase removed its free API tier in 2025 and its cheapest paid plan excludes funding-round data. Neither has a viable free alternative, so PE/VC deal coverage instead comes from the news sources above.

All source URLs, keyword filters, and fetch queries live in [`sources.config.json`](./sources.config.json) — edit there to add/remove feeds without touching code.

## Scheduling

GitHub Actions (`.github/workflows/fetch-news.yml`) runs hourly, hitting the deployed `/api/cron/fetch-news` endpoint, which fetches, dedupes, tags, and writes the result to Vercel Blob. (Vercel's own Cron Jobs feature is Hobby-plan-limited to once/day, hence GitHub Actions instead.)

## Deploy on Vercel

Deployed at [arrowfund-pulse.vercel.app](https://arrowfund-pulse.vercel.app). After deploying:

1. Create a Blob store (Storage tab) and connect it to the project.
2. Set `GNEWS_API_KEY`, `NYT_API_KEY`, and `CRON_SECRET` as environment variables.
3. In the GitHub repo, set the `DEPLOYMENT_URL` and `CRON_SECRET` Actions secrets to match.
