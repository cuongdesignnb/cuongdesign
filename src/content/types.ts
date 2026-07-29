import type { z } from "zod";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ContentRegistryEntry<TSchema extends z.ZodType = z.ZodType> {
  name: string;
  route: string | null;
  schema: TSchema;
  defaultData: z.output<TSchema>;
  sections: string[];
}

export interface ContentActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
