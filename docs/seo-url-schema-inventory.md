# SEO, URL and Schema Inventory

## Identity

| Purpose | Value |
| --- | --- |
| Person name | Đinh Cường |
| Alternate name | Cường Design |
| Brand display | CUONG DESIGN |
| Job title | Freelancer Developer & UI/UX Designer |
| Production URL | `https://cuongdesign.net` |

`src/config/site.ts` is the single source of truth for the production canonical origin. Public pages do not construct the canonical domain directly, and deployment environment host variables cannot override it.

## URL Inventory

| Content | Canonical route | Indexing |
| --- | --- | --- |
| Home | `/` | Content Hub robots |
| About | `/gioi-thieu` | Content Hub robots |
| Services | `/dich-vu` | Content Hub robots |
| Service | `/dich-vu/[slug]` | Published + record robots |
| Process | `/quy-trinh` | Content Hub robots |
| Skills | `/ky-nang` | Content Hub robots |
| Projects | `/du-an` | Content Hub robots |
| Project | `/du-an/[slug]` | Published + record robots |
| Products | `/san-pham` | Content Hub robots |
| Product | `/san-pham/[slug]` | Published + record robots |
| Blog | `/bai-viet` | Content Hub robots |
| Category | `/bai-viet/chuyen-muc/[slug]` | Has published post + record robots |
| Post | `/bai-viet/[slug]` | Published + record robots |
| Reviews | `/danh-gia` | Content Hub robots |
| Contact | `/lien-he` | Content Hub robots |
| Policy | `/[slug]` | Published + record robots |
| Login/admin/preview/checkout/download | Dedicated routes | Noindex or robots disallow |

## Redirect Inventory

- `/bai-viet/:category/:slug` redirects permanently to `/bai-viet/:slug`.
- A legacy category URL `/bai-viet/:slug` redirects to `/bai-viet/chuyen-muc/:slug` when no post owns that slug.
- Project, Product, Post, Category, Service and Page slug changes create `SeoRedirect` records.
- Updating a slug also rewrites prior redirect destinations to the newest URL, preventing redirect chains.

## Schema Matrix

| Route group | Schema |
| --- | --- |
| Root layout | WebSite, Person, ProfessionalService |
| Home/static content | WebPage |
| About | ProfilePage referencing `/#person` |
| Collections | CollectionPage or Blog + ItemList |
| Service detail | WebPage, Service, BreadcrumbList, visible FAQPage |
| Process | WebPage + ItemList |
| Project detail | CreativeWork, SoftwareSourceCode, WebSite or SoftwareApplication |
| Product detail | Product + valid Offer; reviews only when approved and visible |
| Post detail | BlogPosting + BreadcrumbList |
| Reviews | CollectionPage + ItemList + Review; no self-serving business AggregateRating |
| Contact | ContactPage + visible FAQPage |
| Policy | WebPage + BreadcrumbList |

## Previous Risks

- Author identity and brand spelling were inconsistent.
- Blog URLs included category segments and embedded the domain in pages.
- Project schema always claimed `SoftwareSourceCode`.
- Product availability and purchase behavior depended on `price === 0`.
- Product schema contained a synthetic `priceValidUntil`.
- Policy pages were always noindex.
- Sitemap contained unpublished records and request-time `lastModified`.
- Process used obsolete HowTo rich-result markup.
- Reviews attached a self-serving AggregateRating to the business.
