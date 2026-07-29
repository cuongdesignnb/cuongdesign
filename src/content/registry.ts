import { globalContentDefaults } from "./defaults/global";
import { homeContentDefaults } from "./defaults/home";
import {
  aboutContentDefaults,
  blogContentDefaults,
  contactContentDefaults,
  footerContentDefaults,
  processContentDefaults,
  productsContentDefaults,
  projectsContentDefaults,
  reviewsContentDefaults,
  servicesContentDefaults,
  skillsContentDefaults,
  systemCopyDefaults,
} from "./defaults/pages";
import {
  aboutContentSchema,
  blogContentSchema,
  contactContentSchema,
  footerContentSchema,
  globalContentSchema,
  homeContentSchema,
  processContentSchema,
  productsContentSchema,
  projectsContentSchema,
  reviewsContentSchema,
  servicesContentSchema,
  skillsContentSchema,
  systemCopySchema,
} from "./schemas";
import type { ContentRegistryEntry } from "./types";

export const contentRegistry = {
  global: { name: "Global & Brand", route: null, schema: globalContentSchema, defaultData: globalContentDefaults, sections: ["brand", "author", "contact", "social", "seo", "structuredData"] },
  home: { name: "Trang chủ", route: "/", schema: homeContentSchema, defaultData: homeContentDefaults, sections: Object.keys(homeContentDefaults) },
  about: { name: "Giới thiệu", route: "/gioi-thieu", schema: aboutContentSchema, defaultData: aboutContentDefaults, sections: Object.keys(aboutContentDefaults) },
  services: { name: "Dịch vụ", route: "/dich-vu", schema: servicesContentSchema, defaultData: servicesContentDefaults, sections: Object.keys(servicesContentDefaults) },
  process: { name: "Quy trình", route: "/quy-trinh", schema: processContentSchema, defaultData: processContentDefaults, sections: Object.keys(processContentDefaults) },
  skills: { name: "Kỹ năng", route: "/ky-nang", schema: skillsContentSchema, defaultData: skillsContentDefaults, sections: Object.keys(skillsContentDefaults) },
  projects: { name: "Dự án", route: "/du-an", schema: projectsContentSchema, defaultData: projectsContentDefaults, sections: Object.keys(projectsContentDefaults) },
  products: { name: "Sản phẩm", route: "/san-pham", schema: productsContentSchema, defaultData: productsContentDefaults, sections: Object.keys(productsContentDefaults) },
  blog: { name: "Blog", route: "/bai-viet", schema: blogContentSchema, defaultData: blogContentDefaults, sections: Object.keys(blogContentDefaults) },
  reviews: { name: "Reviews", route: "/danh-gia", schema: reviewsContentSchema, defaultData: reviewsContentDefaults, sections: Object.keys(reviewsContentDefaults) },
  contact: { name: "Liên hệ & FAQ", route: "/lien-he", schema: contactContentSchema, defaultData: contactContentDefaults, sections: Object.keys(contactContentDefaults) },
  footer: { name: "Footer", route: null, schema: footerContentSchema, defaultData: footerContentDefaults, sections: Object.keys(footerContentDefaults) },
  "system-copy": { name: "System Copy", route: null, schema: systemCopySchema, defaultData: systemCopyDefaults, sections: Object.keys(systemCopyDefaults) },
} satisfies Record<string, ContentRegistryEntry>;

export type ContentKey = keyof typeof contentRegistry;

export function isContentKey(value: string): value is ContentKey {
  return value in contentRegistry;
}
