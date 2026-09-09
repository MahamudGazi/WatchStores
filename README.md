# WatchStore – Production-Ready Luxury Watch E-Commerce

Professional Django REST Framework + React (Vite) e-commerce platform.

## Features
- Full product catalog with brands, categories, flash sales, reviews
- Guest cart + authenticated cart merge
- Secure checkout with stock locking (`select_for_update` + `transaction.atomic`)
- SSLCommerz payment gateway (sandbox + live ready)
- bKash / Nagad stubs (ready for real merchant keys)
- Coupon system, shipping charges by district
- Order management, invoices (QR), returns foundation
- JWT auth + email verification + password reset
- Jazzmin admin + dashboard reports
- Celery + Redis ready

## Tech Stack
| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Django 6, DRF, SimpleJWT, Celery    |
| Database  | MySQL 8                             |
| Cache/Queue | Redis                             |
| Frontend  | React + Vite + Tailwind             |
| Payments  | SSLCommerz, bKash/Nagad stubs       |
| Server    | Gunicorn + WhiteNoise + Nginx ready |

## Quick Start

### Local
```bash
# Backend
cd backend
cp .env.example .env          # fill SECRET_KEY, DB_*, EMAIL_*, STORE_*
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
cd ../frontend
npm install
npm run dev
```

### Docker
```bash
cp backend/.env.example backend/.env
# edit backend/.env → set DEBUG=False + real secrets for prod
docker compose up --build
```

Health check: `GET /health/`

## Production Checklist Status

### Done / Applied
- [x] Secrets out of repo (`.env` only)
- [x] Production security headers (HSTS, SSL redirect, secure cookies, XSS, X-Frame)
- [x] CORS + CSRF hardened when `DEBUG=False`
- [x] Gunicorn + non-root Docker user
- [x] WhiteNoise static serving
- [x] Product price / discount / stock validation (serializer + model)
- [x] Cart stock validation on add
- [x] Order creation uses `select_for_update` + atomic transaction
- [x] Health endpoint
- [x] Nginx example config
- [x] Frontend multi-stage Dockerfile.prod

### Recommended next (you can request any)
- Full test coverage expansion
- Real bKash/Nagad merchant integration
- Automated DB backups + monitoring (Sentry)
- Image optimization pipeline
- Advanced rate limiting on all auth endpoints
- Frontend error boundaries + loading states polish
- SEO meta + structured data

## Environment
See `backend/.env.example`. Never commit real `.env`.

## License
Private project.
