import { buildWebPageSchema } from "./webpage";
import { schemaIds } from "./ids";

export function buildProfilePageSchema(input: {
  path?: string;
  name: string;
  description?: string;
}) {
  return buildWebPageSchema({
    path: input.path || "/gioi-thieu",
    name: input.name,
    description: input.description,
    type: "ProfilePage",
    mainEntity: { "@id": schemaIds.person() },
  });
}
