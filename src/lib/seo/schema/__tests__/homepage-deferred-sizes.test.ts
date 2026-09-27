import assert from "node:assert/strict";
import test from "node:test";
import {
  homepageProductsDeferredSizes,
  homepageProjectsDeferredSizes,
  homepageServicesDeferredSizes,
  homepageTestimonialsDeferredSizes,
} from "../../../../components/sections/homepage-deferred";

test("service fallback scales with mobile cards and desktop rows", () => {
  const empty = homepageServicesDeferredSizes(0, 0);
  const populated = homepageServicesDeferredSizes(6, 2);

  assert.ok(populated.mobile > empty.mobile);
  assert.ok(populated.desktop > empty.desktop);
});

test("project and product fallbacks separate empty state from populated cards", () => {
  assert.ok(homepageProjectsDeferredSizes(1).mobile > homepageProjectsDeferredSizes(0).mobile);
  assert.ok(homepageProjectsDeferredSizes(4).desktop > homepageProjectsDeferredSizes(3).desktop);
  assert.ok(homepageProductsDeferredSizes(1).mobile > homepageProductsDeferredSizes(0).mobile);
  assert.ok(homepageProductsDeferredSizes(4).desktop > homepageProductsDeferredSizes(3).desktop);
});

test("testimonial fallback scales by cards and desktop rows", () => {
  const empty = homepageTestimonialsDeferredSizes(0);
  const populated = homepageTestimonialsDeferredSizes(4);

  assert.ok(populated.mobile > empty.mobile);
  assert.ok(populated.desktop > empty.desktop);
});
