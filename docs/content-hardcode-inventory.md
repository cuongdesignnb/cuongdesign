# Content hardcode inventory

Không tính label nội bộ Admin, log developer và cấu hình kỹ thuật.

| Nguồn cũ | Route / component | Content key / model | Editor | Media | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| `src/data/site.ts` | Layout, SEO, contact | `global` | No | Yes | Migrated; file còn làm fallback kỹ thuật |
| `src/app/layout.tsx` | Root metadata, JSON-LD | `global` | No | Yes | Migrated |
| `src/components/layout/Footer.tsx` | Footer | `footer`, `global`, `MenuItem`, `ServiceContent` | No | Yes | Migrated |
| `src/components/sections/HeroSection.tsx` | Home hero | `home.hero` | Yes | Yes | Migrated |
| `src/components/sections/AboutSection.tsx` | Home about | `home.about` | Yes | Yes | Migrated |
| `src/components/sections/ServicesSection.tsx` | Home services | `home.services`, `ServiceContent` | No | Yes | Migrated |
| `src/components/sections/FeaturedProjectsSection.tsx` | Home projects | `home.projects`, `Project` | No | No | Migrated |
| `src/components/sections/DigitalProductsSection.tsx` | Home products | `home.products`, `Product` | No | No | Migrated |
| `src/components/sections/WorkProcessSection.tsx` | Home process | `home.process` | No | No | Migrated |
| `src/components/sections/TechStackSection.tsx` | Home technologies | `home.techStack` | No | Yes | Migrated |
| `src/components/sections/TestimonialsSection.tsx` | Home testimonials | `home.testimonials`, `Testimonial` | No | No | Migrated |
| `src/components/sections/CTASection.tsx` | Home CTA | `home.cta` | Yes | Yes | Migrated |
| `src/components/sections/ContactSection.tsx` | Home contact | `home.contact`, `global.contact` | No | No | Migrated |
| `src/app/gioi-thieu/page.tsx` | About page | `about`, `global` | Yes | Yes | Migrated with current arrays as fallback |
| `src/app/dich-vu/page.tsx` | Service listing | `services`, `ServiceContent` | Yes | Yes | Migrated |
| `src/app/dich-vu/[slug]/page.tsx` | Service detail | `ServiceContent` | Yes | Yes | Migrated |
| `src/data/services.ts` | Duplicate service summaries | `ServiceContent` | No | No | Removed |
| `src/data/services-detail.ts` | Initial service detail data | `ServiceContent` | Yes | No | Seed-only; no public consumer |
| `src/app/quy-trinh/page.tsx` | Process page | `process` | Yes | Yes | Migrated with current steps as fallback |
| `src/app/ky-nang/page.tsx` | Skills page | `skills` | No | Yes | Migrated with current groups as fallback |
| `src/app/du-an/page.tsx` | Project listing copy | `projects`, `Project` | Yes | No | Migrated |
| `src/app/san-pham/page.tsx` | Product listing copy | `products`, `Product` | Yes | No | Migrated |
| `src/app/bai-viet/page.tsx` | Blog listing copy | `blog`, `Post`, `Category` | Yes | No | Migrated |
| `src/app/danh-gia/page.tsx` | Reviews page | `reviews`, `Review` | Yes | No | Migrated |
| `src/app/lien-he/page.tsx` | Contact and FAQ | `contact`, `global.contact` | Yes | Yes | Migrated |
| `src/data/faqs.ts` | Duplicate contact FAQ | `contact.faqs` | Yes | No | Removed |
| `src/app/not-found.tsx` | Public 404 | `system-copy` | No | No | Migrated |
| Admin Project/Product/Post/Category/Testimonial | Image fields | `Media` | N/A | Yes | Shared picker migrated |
| Admin Project/Post/Policy/Content Hub | HTML fields | Shared `ContentEditor` | Yes | Yes | Migrated |

## Hardcode removed

- Public self-seeding in `src/app/page.tsx`.
- `src/data/services.ts`.
- `src/data/faqs.ts`.
- `src/components/admin/RichTextEditor.tsx`.
- `src/components/ui/RichTextEditor.tsx`.
- Local media picker modals in Project, Product and Blog managers.
- Manual image URL inputs in Category and Testimonial managers.
