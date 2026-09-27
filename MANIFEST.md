# شفرة — منيو رقمي

## البنية
- saffron-backend/  — Laravel 11 API + MySQL
- saffron-frontend/ — React 19 + Vite + TypeScript + Tailwind

## البيئة
PHP 8.2+ / Node.js 20+ / MySQL 8 / Composer 2

## تشغيل
1. cd saffron-backend && composer install && cp .env.example .env
2. php artisan key:generate
3. عدّل DB في .env ثم: php artisan migrate:fresh --seed
4. cd ../saffron-frontend && npm install && cp .env.example .env
5. php artisan serve
6. npm run dev

## بيانات الدخول
Email: admin@saffron.test
Password: admin1234

## الروابط
Frontend: http://localhost:5173
API:      http://127.0.0.1:8000/api