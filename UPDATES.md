# WatchStore – Latest Fixes

## Batch: API mismatch + responsive + cleanup

### Missing APIs added
- `POST /api/auth/change-password/` – change own password
- `GET/PUT /api/settings/email/` – email notification settings
- `GET/PUT /api/settings/shipping/` – default delivery settings
- `CRUD /api/settings/delivery-charges/` – district shipping charges
- `GET /api/dashboard/export/orders/?format=json|csv` – orders export

### Already fixed earlier
- Dashboard revenue statuses + field aliases
- `top-products` MySQL ExpressionWrapper fix
- `order_number` / `invoice_number` MySQL default migration fix
- Login Forgot Password link + responsive auth pages

### Frontend cleanup
- Single ProductCard implementation (products/ re-exports ProductCard/)
- FeaturedProducts duplicate re-exported
- AdminLayout: overflow-x handling for tables on mobile
- Global CSS: admin table horizontal scroll on small screens

### Responsive
- Customer auth pages improved
- Admin content area scroll-safe on mobile
- Navbar mobile menu already present

## Run
```bash
cd backend && pip install -r requirements.txt
cp .env.example .env   # configure DB
python manage.py migrate
python manage.py runserver

cd frontend && npm install && npm run dev
```
