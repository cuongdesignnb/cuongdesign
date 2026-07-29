import { compact, plainText } from "./shared";

export function buildReviewSchema(input: {
  author: string;
  body: string;
  rating: number;
  itemName?: string;
}) {
  return compact({
    "@type": "Review",
    author: { "@type": "Person", name: input.author },
    reviewBody: plainText(input.body),
    reviewRating: { "@type": "Rating", ratingValue: input.rating, bestRating: 5 },
    itemReviewed: input.itemName
      ? { "@type": "CreativeWork", name: input.itemName }
      : undefined,
  });
}
