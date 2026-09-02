import { schemaIds } from "./ids";
import { buildWebPageSchema } from "./webpage";

export function buildContactPageSchema(input: {
  path?: string;
  name: string;
  description?: string;
}) {
  return buildWebPageSchema({
    path: input.path || "/lien-he",
    name: input.name,
    description: input.description,
    type: "ContactPage",
    mainEntity: { "@id": schemaIds.person() },
  });
}
