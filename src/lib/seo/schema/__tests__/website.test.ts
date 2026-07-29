import test from "node:test";
import { buildWebSiteSchema } from "../website";
import { assertSchema } from "./helpers";

test("WebSite schema", () => assertSchema(buildWebSiteSchema(), "WebSite"));
