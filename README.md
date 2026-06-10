# AcademicRAG

A RAG-powered AI agent built with Next.js that lets you upload academic PDFs and ask questions — answers are grounded strictly in your documents.

## Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Vector Store**: LanceDB (local, no external service)
- **Embeddings + LLM**: OpenAI (`text-embedding-3-small` + `gpt-4o-mini`)
- **Testing**: Jest + ts-jest + React Testing Library
- **CI/CD**: GitHub Actions (test → build → block merge on failure)
- **Caching**: In-memory LRU (swap to Redis for production)
- **Validation**: Zod on all API inputs

## Setup

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in OPENAI_API_KEY in .env.local

# 3. Run dev server
npm run dev
# Open http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run tests + coverage report |
| `npm run type-check` | TypeScript type check |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts   # PDF ingest endpoint
│   │   └── chat/route.ts     # RAG chat endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatWindow.tsx
│   ├── PDFUploader.tsx
│   └── MessageBubble.tsx
├── lib/
│   ├── chunker.ts       # Text splitting
│   ├── embeddings.ts    # OpenAI embeddings + cosine similarity
│   ├── pdfParser.ts     # PDF text extraction
│   ├── vectorStore.ts   # LanceDB CRUD
│   └── cache.ts         # In-memory LRU cache
└── types/index.ts
__tests__/
├── lib/                 # Unit tests
└── api/                 # Integration tests (mocked)
.github/workflows/ci.yml # GitHub Actions CI/CD
```

## CI/CD

Every push triggers:
1. `type-check` → `lint` → `test:coverage`
2. `build` (only if tests pass)

**To enforce branch protection on `main`:**
1. GitHub → Settings → Branches → Add rule for `main`
2. ✅ Require status checks: `Test & Lint`, `Build check`
3. ✅ Require branches to be up to date before merging

Add `OPENAI_API_KEY` as a repository secret under Settings → Secrets.

## Non-functional requirements

| Requirement | Implementation |
|---|---|
| Caching | LRU in-memory cache with 5-min TTL |
| Performance | Batch embeddings, HNSW index via LanceDB |
| Validation | Zod schemas, file type + size guards |
| Security | API key in env only, `nosniff`/`DENY` headers |
| Optimization | `temperature: 0.2`, `gpt-4o-mini` for cost |
| Observability | Error logging on all catch blocks |
| Test coverage | 70% threshold enforced in CI |
