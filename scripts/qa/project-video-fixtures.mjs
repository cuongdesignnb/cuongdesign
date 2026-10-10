import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import http from 'node:http';
import bcrypt from 'bcryptjs';

const testUrl = 'postgresql://qa:local_test_only@127.0.0.1:15439/cuongdesign_youtube_test?schema=public';
if (process.env.TEST_DATABASE_URL !== testUrl) throw new Error('Requires the isolated local QA database.');
const db = new PrismaClient({ datasources: { db: { url: testUrl } } });
const image = 'http://127.0.0.1:13441/fixture.png';
const png = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#eef2f6"/><rect width="220" height="800" fill="#15212b"/><text x="40" y="70" font-family="sans-serif" font-size="30" fill="white">LOCAL QA</text><text x="260" y="90" font-family="sans-serif" font-size="36" fill="#15212b">Synthetic screen fixture</text><rect x="260" y="140" width="880" height="240" rx="8" fill="#d2e5f5"/><path d="M300 330L450 230L620 300L780 180L1080 200" fill="none" stroke="#217e60" stroke-width="10"/><rect x="260" y="420" width="410" height="280" fill="white"/><rect x="710" y="420" width="430" height="280" fill="white"/><text x="290" y="480" font-family="sans-serif" font-size="28" fill="#15212b">Test data only</text><text x="740" y="480" font-family="sans-serif" font-size="28" fill="#15212b">No customer data</text></svg>`)).png().toBuffer();
const headings = ['Quản lý dịch vụ rõ giá và thời lượng', 'Lịch hẹn và trạng thái công việc', 'Nội dung dài cần xuống dòng trên màn hình điện thoại nhỏ', 'Danh sách và các bước triển khai', 'Hình ảnh có kích thước và chú thích', 'Liên kết và thông tin tham khảo', 'Bàn giao và kiểm thử'];
const body = headings.map((title, index) => `<h2>${title}</h2><p>Đây là nội dung kiểm thử LOCAL cho template dự án, không phải bài của khách hàng. Phần hiển thị phải dễ đọc và không thay đổi dữ liệu.</p>${index === 0 ? '<h3>H3 trong fixture: phân cấp thân bài</h3><p>Heading này là dữ liệu thử, không phải nhãn template.</p>' : ''}${index === 3 ? '<ul><li>Mục cấp một<ol><li>Bước lồng nhau<ul><li>Ghi chú cấp ba</li></ul></li></ol></li><li>Mục tiếp theo</li></ul><blockquote><p>Giữ nội dung rõ ràng và tránh cam kết kết quả thiếu bằng chứng.</p></blockquote>' : ''}${index === 4 ? `<figure><img src="${image}?body=1" alt="Màn hình dữ liệu tổng hợp trong fixture local" width="1200" height="800" loading="lazy"><figcaption>Chú thích ảnh: dữ liệu giả phục vụ kiểm thử, không phải màn hình khách hàng.</figcaption></figure>` : ''}${index === 5 ? `<p><a href="/lien-he" target="_blank" rel="noopener noreferrer">Liên hệ</a> và <a href="https://example.com/${'long-url-'.repeat(28)}">https://example.com/${'long-url-'.repeat(28)}</a></p><pre><code>${'const value = 1234567890; '.repeat(30)}</code></pre>` : ''}`).join('');
const common = { title: 'Fixture LOCAL: phần mềm quản lý', description: 'Dữ liệu giả, chỉ chạy trong database Docker test riêng.', content: body, coverImage: `${image}?cover`, images: Array.from({ length: 8 }, (_, index) => `${image}?screen=${index}`), techStack: ['PHP', 'MySQL'], isPublished: true, robotsIndex: false, robotsFollow: true, seoTitle: 'Fixture LOCAL', seoDescription: 'Dữ liệu kiểm thử local', seoKeywords: [], publishedAt: new Date('2026-10-01T00:00:00Z'), updatedAt: new Date('2026-10-10T00:00:00Z') };
for (const [slug, count] of [['qa-nail-equivalent', 8], ['qa-second-project', 6]]) {
  const data = { ...common, images: common.images.slice(0, count), category: 'Web Application', youtubeUrl: null };
  await db.project.upsert({ where: { slug }, create: { ...data, slug }, update: data });
}
await db.project.upsert({ where: { slug: 'qa-project-video' }, create: { ...common, slug: 'qa-project-video', category: 'Web Application', youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE' }, update: { ...common, youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE' } });
for (const [slug, youtubeUrl] of [['qa-product-no-video', null], ['qa-product-video', 'https://www.youtube.com/watch?v=M7lc1UVf-VE']]) {
  const data = { ...common, price: 150000, salePrice: 120000, features: ['Tính năng dữ liệu giả', 'Không giao dịch thật'], maxDownloads: 7, type: 'SOURCE_CODE', pricingMode: 'FIXED', youtubeUrl };
  await db.product.upsert({ where: { slug }, create: { ...data, slug }, update: data });
}
await db.user.upsert({ where: { email: 'qa-admin@local.test' }, create: { email: 'qa-admin@local.test', name: 'LOCAL QA', role: 'ADMIN', password: await bcrypt.hash('local-qa-password', 10) }, update: {} });
await db.post.upsert({ where: { slug: 'qa-blog-fixture' }, create: { slug: 'qa-blog-fixture', title: 'Blog fixture LOCAL', content: body, coverImage: image, coverImageAlt: 'Synthetic local test screen', status: 'PUBLISHED', publishedAt: new Date('2026-10-01T00:00:00Z'), robotsIndex: false, seoKeywords: [] }, update: {} });
await db.$disconnect();
const server = http.createServer((request, response) => {
  if (request.url?.startsWith('/fixture.png')) {
    response.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' }); response.end(png);
  } else { response.writeHead(404); response.end(); }
});
server.listen(13441, '127.0.0.1', () => console.log('Synthetic assets and fixtures ready on 127.0.0.1:13441. Local QA database only.'));
