import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { parseProjectCompletedAt, projectCompletedAtForUpdate, projectCompletedAtFormState, ProjectDateValidationError } from "../project-dates";

test("project completion accepts only real YYYY-MM-DD calendar days without rollover", () => {
  for (const day of ["2026-05-15", "2024-02-29", "2000-02-29", "0001-01-01", "0099-12-31", "9999-12-31"]) {
    assert.equal(parseProjectCompletedAt(day)?.toISOString(), `${day}T00:00:00.000Z`);
  }
  for (const value of ["Tue May 15", "15/05/2026", "2026-5-15", "2026-02-29", "1900-02-29", "2026-04-31", "2026-00-10", "2026-13-10", "2026-01-00", "0000-01-01", "2026-05-15T00:00:00Z", " 2026-05-15 ", 42, {}, true, new Date(), new Date(NaN)]) {
    assert.throws(() => parseProjectCompletedAt(value), ProjectDateValidationError, String(value));
  }
});

test("missing completion is omitted; explicit empty/null clears; new omitted completion is null", () => {
  assert.equal(parseProjectCompletedAt(undefined), undefined);
  assert.equal(parseProjectCompletedAt(undefined) ?? null, null);
  for (const value of [null, "", "  "]) assert.equal(parseProjectCompletedAt(value), null);
  const previous = new Date("2026-05-15T23:30:00.000Z");
  assert.equal(projectCompletedAtForUpdate(undefined, previous), undefined);
  assert.equal(projectCompletedAtForUpdate(null, previous), null);
  assert.equal(projectCompletedAtForUpdate(parseProjectCompletedAt("2026-05-15"), previous), previous);
  assert.equal(projectCompletedAtForUpdate(parseProjectCompletedAt("2026-05-16"), previous)?.toISOString(), "2026-05-16T00:00:00.000Z");
});

test("server/form serialization is UTC calendar day and malformed stored values are flagged", () => {
  for (const value of [null, undefined, ""]) assert.deepEqual(projectCompletedAtFormState(value), { value: "" });
  for (const value of [new Date("2026-05-15T00:00:00Z"), new Date("2026-05-15T23:30:00Z"), "2026-05-15", "2026-05-15T23:30:00.000Z"]) {
    assert.deepEqual(projectCompletedAtFormState(value), { value: "2026-05-15" });
  }
  for (const value of [new Date(NaN), "Tue May 15", "2026-02-30T00:00:00.000Z", "2026-02-29", 42, {}]) {
    const state = projectCompletedAtFormState(value);
    assert.equal(state.value, "");
    assert.ok(state.error);
  }
  assert.deepEqual(projectCompletedAtFormState(new Date("2001-05-14T17:00:00.000Z")), { value: "2001-05-14" });
});

test("UTC date representation stays stable in negative/positive browser-equivalent timezones", () => {
  const original = process.env.TZ;
  try {
    for (const timezone of ["UTC", "America/Los_Angeles", "Asia/Bangkok"]) {
      process.env.TZ = timezone;
      for (const timestamp of ["2026-05-15T00:00:00.000Z", "2026-05-15T23:30:00.000Z", "2024-02-29T00:00:00.000Z"]) {
        const date = new Date(timestamp);
        const state = projectCompletedAtFormState(date);
        assert.equal(state.value, timestamp.slice(0, 10));
        assert.equal(projectCompletedAtForUpdate(parseProjectCompletedAt(state.value), date), date);
      }
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("legacy Date.toString slice loses year and accepts a bogus 2001 date", () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = "UTC";
    const oldValue = String(new Date("2026-05-15T00:00:00.000Z")).slice(0, 10);
    assert.equal(oldValue, "Fri May 15");
    assert.equal(new Date(oldValue).getFullYear(), 2001);
    assert.throws(() => parseProjectCompletedAt(oldValue), ProjectDateValidationError);
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("project edit boundary normalizes dates and malformed form state blocks silent saves", () => {
  const route = readFileSync("src/app/(admin)/admin/projects/[id]/page.tsx", "utf8");
  const form = readFileSync("src/components/sections/AdminProjectsManager.tsx", "utf8");
  assert.match(route, /projectCompletedAtFormState\(project.completedAt\)/);
  assert.doesNotMatch(form, /String\(project.completedAt\)\.slice/);
  assert.match(form, /if \(completedAtError\) return/);
  assert.match(form, /fieldErrors\?\.completedAt/);
  assert.match(form, /role="alert"/);
});
