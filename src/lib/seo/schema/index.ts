import type { GlobalContent } from "@/content/defaults/global";
import { buildPersonSchema } from "./person";
import { buildProfessionalServiceSchema } from "./professional-service";
import { buildWebSiteSchema } from "./website";

export * from "./article";
export * from "./breadcrumb";
export * from "./collection-page";
export * from "./contact-page";
export * from "./ids";
export * from "./item-list";
export * from "./person";
export * from "./product";
export * from "./professional-service";
export * from "./profile-page";
export * from "./project";
export * from "./review";
export * from "./service";
export * from "./software-application";
export * from "./webpage";
export * from "./website";

export function buildSitewideGraph(global?: GlobalContent) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebSiteSchema(global),
      buildPersonSchema(global),
      buildProfessionalServiceSchema(undefined, global),
    ],
  };
}
