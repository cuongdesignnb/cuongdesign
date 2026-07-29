import test from "node:test";
import { buildServiceSchema } from "../service";
import { assertSchema } from "./helpers";

test("Service schema", () =>
  assertSchema(
    buildServiceSchema({ slug: "lap-trinh-web", name: "Lập trình web", description: "<p>Dịch vụ</p>" }),
    "Service",
  ));
