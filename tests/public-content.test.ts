import { describe, it, expect } from "vitest";
import { modules } from "../src/lib/modules";
import { moduleSchema } from "../src/lib/validation";
import { inquirySchema as arabicInquirySchema } from "../src/lib/validation-ar";
import copy from "../src/lib/ar-copy.json";
import { serviceCatalog } from "../src/lib/service-catalog";
describe("public bilingual content boundaries", () => {
  it("has Arabic translations for all 20 seeded service descriptions and workflow lines", () => {
    for (const s of serviceCatalog) {
      expect(s.name_ar).toMatch(/[\u0600-\u06ff]/);
      for (const field of [
        "description",
        "benefits",
        "deliverables",
        "workflow",
      ] as const)
        for (const line of s[field].split("\n"))
          expect(
            (copy as Record<string, string>)[line],
            s.slug + " " + line,
          ).toMatch(/[\u0600-\u06ff]/);
    }
  });
  it("rejects executable and non-HTTPS project URLs", () => {
    const schema = moduleSchema(modules.portfolio).shape.external_url;
    expect(schema.safeParse("https://example.com/").success).toBe(true);
    for (const external_url of [
      "javascript:alert(1)",
      "data:text/html,example",
      "http://example.com",
    ])
      expect(schema.safeParse(external_url).success).toBe(false);
  });
  it("requires consent with an Arabic validation message", () => {
    const result = arabicInquirySchema.safeParse({
      name: "اسم تجريبي",
      email: "test@example.invalid",
      phone: "+201000000000",
      service: "تطوير المواقع",
      description: "هذه رسالة تجريبية طويلة بما يكفي للاختبار.",
      website: "",
      consent: false,
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(
        result.error.issues.find((i) => i.path[0] === "consent")?.message,
      ).toMatch(/[\u0600-\u06ff]/);
  });
});
