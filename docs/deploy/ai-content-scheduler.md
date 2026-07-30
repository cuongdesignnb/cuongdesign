# AI Content Scheduler

## Kiến trúc

- `ai-worker` chạy trong container riêng, gọi queue processor mỗi 60 giây.
- Web admin chỉ đọc trạng thái mỗi 15 giây và không tự kích hoạt hàng đợi.
- Atomic claim bằng `claimToken` bảo đảm một item chỉ được một worker xử lý.
- Mỗi item thử tối đa 3 lần, backoff 2 phút rồi 5 phút.
- Item đang xử lý quá 30 phút được đưa lại về `PENDING`.
- API viết bài và API sinh ảnh dùng hai key độc lập.
- Nếu production chưa có service `ai-worker`, worker nhúng trong Next.js vẫn là phương án dự phòng. Cấu hình chuẩn nên dùng container riêng và đặt `AI_QUEUE_EMBEDDED_WORKER=false` cho `web`.

## Cấu hình

Trong Admin > Cấu hình hệ thống:

1. Nhập `OpenAI API key viết bài`.
2. Chọn model viết bài, mặc định `gpt-5-mini`.
3. Nhập `OpenAI API key sinh ảnh` riêng.
4. Chọn model sinh ảnh, mặc định `gpt-image-1`.
5. Đặt batch limit từ 1 đến 20.
6. Chỉ bật scheduler sau khi cả cấu hình và lịch bài đã được kiểm tra.

Key để trống khi lưu sẽ giữ nguyên giá trị đang có. Key không được trả lại cho trình duyệt.

Có thể dùng biến môi trường thay cho Setting:

```bash
OPENAI_TEXT_API_KEY=
OPENAI_TEXT_MODEL=gpt-5-mini
OPENAI_IMAGE_API_KEY=
OPENAI_IMAGE_MODEL=gpt-image-1
```

Image key không tự fallback sang text key.

## Deploy Docker

Không chạy các lệnh này trước khi nhánh đã được review và merge.

```bash
cd /www/wwwroot/cuongdesign.net

git pull --ff-only origin main

mkdir -p backups
BACKUP="backups/pre-ai-scheduler-$(date +%F-%H%M%S).sql"
docker compose exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' > "$BACKUP"
test -s "$BACKUP"

docker compose build web
docker compose run --rm --no-deps web npx prisma migrate deploy
docker compose up -d --force-recreate web ai-worker
```

Nếu `docker-compose.yml` trên production có thay đổi cục bộ, cần thêm service `ai-worker` và biến `AI_QUEUE_EMBEDDED_WORKER=false` vào cấu hình production trước khi chạy `up`. Không ghi đè file Compose chứa cấu hình production.

## Xác minh

```bash
docker compose ps
docker compose logs --tail=100 web
docker compose logs --tail=100 ai-worker
docker compose exec -T web npx prisma migrate status
```

Kết quả cần có:

- `web`, `postgres`, `ai-worker` đều ở trạng thái `Up`.
- Log worker có `AI_QUEUE_STANDALONE_WORKER_STARTED`.
- Mỗi phút có `AI_QUEUE_RUN_STARTED` và `AI_QUEUE_RUN_FINISHED`.
- Admin > AI Blog Queue hiển thị scheduler online sau tối đa 3 phút.
- Không có API key, authorization header hoặc database password trong log.

Có thể kiểm tra heartbeat trong database mà không đọc secret:

```bash
docker compose exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
  "SELECT key, value FROM \"Setting\" WHERE key LIKE '\''ai_queue_scheduler_%'\'' ORDER BY key;"'
```

## Vận hành

- `Tự động đăng bài` chỉ áp dụng cho item mới được tạo từ form.
- Item cũ giữ `autoPublish=false` sau migration.
- Nút xử lý ngay và retry trong admin là công cụ hỗ trợ, không phải scheduler chính.
- Tắt `Chạy lịch tự động phía server` trước khi bảo trì API hoặc kiểm tra quota.
- Ảnh đã sinh được lưu ở volume `media_uploads`; phải backup volume này cùng database.

## Rollback ứng dụng

Không xóa migration đã áp dụng. Tắt scheduler, đưa web về image trước và giữ nguyên cột mới:

```bash
docker compose stop ai-worker
docker compose up -d --force-recreate web
```

Nếu cần khôi phục dữ liệu, dùng file backup đã tạo và thực hiện trong maintenance window.
