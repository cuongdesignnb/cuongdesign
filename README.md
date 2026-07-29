# Cuong Design

Portfolio, cửa hàng sản phẩm số và hệ thống quản trị nội dung xây dựng bằng Next.js 16, PostgreSQL, Prisma và Auth.js.

## Chạy bằng Docker

```bash
docker compose up -d --build
```

Ứng dụng: `http://localhost:13000`

PostgreSQL: `localhost:5439`

Container `web` tự chạy `prisma migrate deploy` trước khi khởi động. Ảnh upload được giữ trong volume `media_uploads`, database được giữ trong volume `postgres_design_data`.

## Khởi tạo dữ liệu

Chỉ chạy seed sau khi migrate database. Seed dùng `upsert`, tạo admin mặc định, dữ liệu collection ban đầu và 13 Content Document.

```powershell
$env:DATABASE_URL="postgresql://cuongdesign_user:cuongdesign_password@localhost:5439/cuongdesign_db"
npx prisma migrate deploy
npm run seed
```

Chỉ seed Content Hub và dịch vụ:

```powershell
npm run seed:content
```

Public routes không thực hiện seed hoặc ghi dữ liệu.

## Admin

Trang đăng nhập: `http://localhost:13000/login`

Tài khoản development được tạo bởi seed:

```text
admin@cuongdesign.com
adminpassword
```

Đổi mật khẩu và các giá trị `AUTH_SECRET`/`NEXTAUTH_SECRET` trước khi triển khai production.

## Content Hub

Content Hub nằm tại `/admin/content` và gồm các tab Global, Home, About, Services, Process, Skills, Projects, Products, Blog, Reviews, Contact, Footer và System Copy.

Quy trình nội dung:

1. `Save draft` chỉ cập nhật `draftData`.
2. `Preview` bật Draft Mode cho admin đang đăng nhập.
3. `Publish` tạo revision, cập nhật `publishedData` và revalidate route/cache tag.
4. `Lịch sử` cho phép khôi phục một revision về bản nháp.

Mọi field ảnh dùng Media Library chung tại `/admin/media`. Nội dung HTML dùng TipTap `ContentEditor` và được sanitize ở server.

## Deploy database hiện có

Nên backup trước mỗi lần migrate:

```bash
pg_dump -Fc -h localhost -p 5439 -U cuongdesign_user cuongdesign_db > backup.dump
npx prisma migrate deploy
```

Không chạy `prisma migrate reset` trên database có dữ liệu. File backup SQL không được đưa vào Docker image nhờ `.dockerignore`.

## Kiểm tra

```bash
npx tsc --noEmit
npm run lint
npm run build
docker compose ps
docker compose logs web --tail 100
```

Inventory nguồn nội dung và trạng thái migration nằm tại `docs/content-hardcode-inventory.md`.
