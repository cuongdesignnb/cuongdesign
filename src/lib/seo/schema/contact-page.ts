import { schemaIds } from "./ids";
import { buildWebPageSchema } from "./webpage";

export function buildContactPageSchema(input: {
  name: string;
  description?: string;
}) {
  return buildWebPageSchema({
    path: "/lien-he",
    name: input.name,
    description: input.description,
    type: "ContactPage",
    mainEntity: { "@id": schemaIds.person() },
  });
}
