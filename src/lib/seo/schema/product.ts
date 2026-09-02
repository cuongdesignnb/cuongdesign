import type { ProductAvailability, ProductPricingMode } from "@prisma/client";
import { absoluteUrl } from "../url";
import { schemaIds } from "./ids";
import { compact, plainText } from "./shared";

const availabilityMap: Record<ProductAvailability, string> = {
  IN_STOCK: "https://schema.org/InStock",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
  PRE_ORDER: "https://schema.org/PreOrder",
  LIMITED: "https://schema.org/LimitedAvailability",
};

export function buildProductSchema(input: {
  slug: string;
  path?: string;
  name: string;
  description: string;
  images: string[];
  sku?: string | null;
  brandName?: string | null;
  pricingMode: ProductPricingMode;
  price: number;
  salePrice?: number | null;
  currency: string;
  availability: ProductAvailability;
  priceValidUntil?: Date | null;
  reviews?: {
    rating: number;
    comment: string;
    user: { name: string | null };
  }[];
}) {
  const path = input.path || `/san-pham/${input.slug}`;
  const reviews = input.reviews || [];
  const canOffer = input.pricingMode !== "CONTACT";
  const amount = input.pricingMode === "FREE" ? 0 : input.salePrice ?? input.price;

  return compact({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": schemaIds.entity(path, "product"),
    url: absoluteUrl(path),
    name: input.name,
    description: plainText(input.description),
    image: input.images.map(absoluteUrl),
    sku: input.sku,
    brand: { "@type": "Brand", name: input.brandName || "Cường Design" },
    offers: canOffer
      ? {
          "@type": "Offer",
          url: absoluteUrl(path),
          price: amount,
          priceCurrency: input.currency,
          availability: availabilityMap[input.availability],
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": schemaIds.business() },
          priceValidUntil: input.priceValidUntil?.toISOString().slice(0, 10),
        }
      : undefined,
    aggregateRating: reviews.length
      ? {
          "@type": "AggregateRating",
          ratingValue: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
          reviewCount: reviews.length,
        }
      : undefined,
    review: reviews.map((review) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5 },
      author: { "@type": "Person", name: review.user.name || "Khách hàng" },
      reviewBody: plainText(review.comment),
    })),
  });
}
