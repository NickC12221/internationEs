# Femme Directory

A full-stack, production-ready model directory platform built with **Next.js 14**, **PostgreSQL** (Prisma ORM), **S3-compatible storage**, and **JWT authentication**. Models can create profiles, upload photos, and be discovered by country and city. Admins can manage listings, handle verifications, and upgrade profiles to premium.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (jose) + HttpOnly cookies |
| Storage | AWS S3 / S3-compatible (MinIO locally) |
| Styling | Tailwind CSS |
| Validation | Zod |
| File Upload | Presigned S3 URLs + react-dropzone |
| Payments | Stripe-ready placeholder |

---

## Project Structure

```
femme-directory/
├── prisma/
│   ├── schema.prisma         # Full database schema
│   └── seed.ts               # Sample data seeder
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/         # signup, signin, signout, me
│   │   │   ├── profiles/     # list, update, [slug]
│   │   │   ├── profile-images/ # upload, delete, set-main
│   │   │   ├── locations/    # country/city groups for sidebar
│   │   │   ├── upload/       # presigned S3 URL generator
│   │   │   ├── verification/ # submit & check status
│   │   │   ├── favorites/    # bookmark profiles
│   │   │   ├── premium/      # checkout + Stripe webhook
│   │   │   └── admin/        # stats, users, profiles, verifications
│   │   ├── [countryCode]/
│   │   │   └── [citySlug]/
│   │   │       └── [slug]/   # Public profile page
│   │   ├── dashboard/        # Model dashboard, images, verify, premium
│   │   ├── admin/            # Admin panel pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── search/
│   ├── components/
│   │   ├── layout/           # Header, LocationSidebar
│   │   └── model/            # ModelCard, ModelGrid
│   ├── lib/
│   │   ├── db/               # Prisma singleton
│   │   ├── auth/             # JWT sign/verify/session
│   │   ├── storage/          # S3 upload/delete/presign
│   │   └── utils/            # cn, slugify, rateLimit, validation
│   ├── middleware.ts          # Route protection
│   └── types/                # Shared TypeScript interfaces
├── docker-compose.yml         # Local Postgres + MinIO + Redis
├── .env.example
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local services)
- An AWS account OR MinIO locally (included in Docker Compose)

---

### 1. Clone & Install

```bash
git clone https://github.com/yourorg/femme-directory.git
cd femme-directory
npm install
```

---

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database — matches docker-compose defaults
DATABASE_URL="postgresql://postgres:password@localhost:5432/femme_directory"

# Generate a strong secret: openssl rand -base64 48
JWT_SECRET="your-64-character-random-string"

# MinIO local settings (matches docker-compose)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="minioadmin"
AWS_SECRET_ACCESS_KEY="minioadmin"
S3_ENDPOINT="http://localhost:9000"
S3_PUBLIC_BUCKET="femme-public"
S3_PRIVATE_BUCKET="femme-private"
CDN_URL="http://localhost:9000/femme-public"
```

---

### 3. Start Local Services

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **MinIO** (S3-compatible) on port `9000`, console on `9001`
- **Redis** on port `6379`
- Auto-creates the `femme-public` and `femme-private` buckets

Verify MinIO is running by visiting: http://localhost:9001 (login: `minioadmin` / `minioadmin`)

---

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed with sample data
npm run db:seed
```

This creates:
- Admin account: `admin@femmedirectory.com` / `Admin@123456`
- 5 sample model accounts: `sofia@example.com`, `elena@example.com`, etc. (password: `Model@123456`)

---

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## URL Structure

| URL | Description |
|---|---|
| `/` | All models (homepage) |
| `/ae` | Models in United Arab Emirates |
| `/ae/dubai` | Models in Dubai |
| `/ae/dubai/sofia-milano-dubai` | Individual profile page |
| `/search?q=sofia` | Search results |
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Model dashboard |
| `/dashboard/images` | Photo management |
| `/dashboard/verify` | Verification submission |
| `/dashboard/premium` | Upgrade to premium |
| `/admin` | Admin dashboard |
| `/admin/verifications` | Review verification requests |
| `/admin/profiles` | Manage all profiles |
| `/admin/users` | View all user accounts |

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create account + profile |
| POST | `/api/auth/signin` | — | Sign in, returns JWT cookie |
| POST | `/api/auth/signout` | — | Clear session cookie |
| GET | `/api/auth/me` | ✓ | Current user + profile |

### Profiles

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/profiles` | — | List/search profiles |
| PATCH | `/api/profiles` | Model | Update own profile |
| GET | `/api/profiles/[slug]` | — | Single profile by slug |

**Query params for GET /api/profiles:**
- `countryCode` — ISO 2-letter code (e.g. `AE`)
- `citySlug` — URL-safe city name (e.g. `dubai`)
- `availability` — `AVAILABLE`, `BUSY`, `TRAVELING`, `UNAVAILABLE`
- `search` — Free text search
- `page` — Page number (default: 1)
- `pageSize` — Results per page (max: 48)

### Images

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Model | Get presigned S3 upload URL |
| POST | `/api/profile-images` | Model | Save image metadata after upload |
| DELETE | `/api/profile-images/[id]` | Model | Delete image |
| PATCH | `/api/profile-images/[id]/main` | Model | Set as main/profile photo |

### Verification

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/verification` | Model | Submit verification request |
| GET | `/api/verification` | Model | Get own verification status |

### Favorites

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/favorites` | Model | List bookmarked profiles |
| POST | `/api/favorites` | Model | Bookmark a profile |
| DELETE | `/api/favorites` | Model | Remove bookmark |

### Locations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/locations` | — | All countries + cities with counts |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/users` | Admin | All user accounts |
| GET | `/api/admin/profiles` | Admin | All profiles |
| PATCH | `/api/admin/profiles` | Admin | Update any profile |
| GET | `/api/admin/verifications` | Admin | List verification requests |
| PATCH | `/api/admin/verifications` | Admin | Approve or reject |

### Premium

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/premium/checkout` | Model | Create order (Stripe placeholder) |
| POST | `/api/premium/webhook` | — | Stripe webhook receiver |

---

## Database Schema

```
User
  id, email, password, role (MODEL|ADMIN)

Profile
  id, userId, displayName, slug (unique)
  country, countryCode, city, citySlug
  bio, age
  email, phone, instagram, twitter, website
  availability (AVAILABLE|UNAVAILABLE|TRAVELING|BUSY)
  listingTier (FREE|PREMIUM), premiumExpiresAt
  isActive, isVerified
  profileImageUrl

ProfileImage
  id, profileId, url, key, order, isMain

VerificationRequest
  id, userId, status (PENDING|APPROVED|REJECTED)
  idImageKey, videoKey (private S3 keys)
  adminNotes, reviewedAt, reviewedBy

Favorite
  id, userId, profileId (unique pair)

PremiumOrder
  id, profileId, amount, currency, status
  stripePaymentIntentId, durationDays
```

---

## User Roles

### Guest (unauthenticated)
- Browse all public profiles
- Filter by country, city, availability
- View individual profile pages
- Search by name

### Model (authenticated)
- All guest capabilities
- Edit own profile (name, bio, contact, availability)
- Upload/manage photos (up to 20)
- Submit verification request
- Upgrade to premium (Stripe)
- Bookmark/favorite other profiles

### Admin (authenticated + ADMIN role)
- All model capabilities
- View admin dashboard with stats
- Review and approve/reject verification requests
- Upgrade/downgrade any profile to premium
- Toggle profile verification and active status
- View all user accounts

---

## Listing Logic

Profiles in any city are sorted:

1. **Premium first** — `listingTier = 'PREMIUM'`
2. **Then by recency** — `createdAt DESC`

Premium profiles appear above free profiles in all city, country, and search listings.

---

## Security

| Concern | Implementation |
|---|---|
| Password storage | `bcryptjs` with 12 salt rounds |
| Session tokens | Signed JWTs (HS256) in HttpOnly cookies |
| Route protection | Next.js `middleware.ts` checks JWT on protected paths |
| Admin routes | Double-checked server-side in every API handler |
| Rate limiting | In-memory limiter on auth and upload routes |
| Private files | Verification docs in a separate private S3 bucket |
| Input validation | Zod schemas on all API inputs |
| CSRF | SameSite=Lax cookies, state-changing endpoints use POST/PATCH/DELETE |

---

## Adding Stripe Payments

1. Install Stripe: `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`

2. Add to `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. In `src/app/api/premium/checkout/route.ts`, uncomment the Stripe block and replace the placeholder.

4. In `src/app/api/premium/webhook/route.ts`, uncomment the event handler to activate premium on successful payment.

5. In `src/app/dashboard/premium/page.tsx`, replace the `handleUpgrade` function to use Stripe Elements or redirect to a Stripe Checkout session.

---

## Deploying to Production

### Database
Use [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app) for managed PostgreSQL.

### Storage
Use AWS S3 or [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces). Set `S3_ENDPOINT` only for non-AWS providers. Create two buckets:
- `femme-public` — public read ACL
- `femme-private` — private (no public access)

### Hosting
Deploy to [Vercel](https://vercel.com) (recommended for Next.js):
```bash
vercel deploy
```

Set all environment variables in the Vercel dashboard. Run migrations with:
```bash
DATABASE_URL="your-prod-url" npx prisma migrate deploy
```

### Rate Limiting in Production
Replace the in-memory rate limiter in `src/lib/utils/rateLimit.ts` with a Redis-backed limiter using `ioredis`:

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible'
import Redis from 'ioredis'

const redisClient = new Redis(process.env.REDIS_URL!)
const limiter = new RateLimiterRedis({ storeClient: redisClient, points: 10, duration: 900 })
```

---

## Development Commands

```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema changes (dev only, no migration file)
npm run db:migrate   # Create and run a migration (for production)
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed sample data
```

---

## License

MIT
