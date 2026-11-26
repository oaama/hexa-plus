import { describe, it, expect } from "vitest";
import { invoiceTotals } from "../src/lib/finance";
import { moduleSchema, inquirySchema } from "../src/lib/validation";
import { modules } from "../src/lib/modules";
describe("financial integrity", () => {
  it("calculates integer minor units without floating money", () =>
    expect(
      invoiceTotals(
        [{ description: "Service", quantity: 3, unit_price_minor: 1999 }],
        1400,
      ),
    ).toEqual({ subtotal: 5997, tax: 840, total: 6837 }));
  it("rounds half minor units up", () =>
    expect(
      invoiceTotals(
        [{ description: "Small line", quantity: 1, unit_price_minor: 5 }],
        1000,
      ).tax,
    ).toBe(1));
  it("rejects empty invoices", () =>
    expect(() => invoiceTotals([], 0)).toThrow());
  it("rejects fractional quantities", () =>
    expect(() =>
      invoiceTotals([
        { description: "Service", quantity: 1.5, unit_price_minor: 10 },
      ]),
    ).toThrow());
  it("rejects negative prices", () =>
    expect(() =>
      invoiceTotals([
        { description: "Service", quantity: 1, unit_price_minor: -1 },
      ]),
    ).toThrow());
  it("rejects excessive tax", () =>
    expect(() =>
      invoiceTotals(
        [{ description: "Service", quantity: 1, unit_price_minor: 10 }],
        10001,
      ),
    ).toThrow());
});
describe("input boundaries", () => {
  it("rejects unauthorized columns", () =>
    expect(
      moduleSchema(modules.clients).partial().safeParse({ role_id: "x" })
        .success,
    ).toBe(false));
  it("rejects javascript media URLs", () =>
    expect(
      moduleSchema(modules.portfolio)
        .partial()
        .safeParse({ thumbnail_url: "javascript:alert(1)" }).success,
    ).toBe(false));
  it("requires actual calendar dates", () =>
    expect(
      moduleSchema(modules.projects)
        .partial()
        .safeParse({ deadline: "2026-02-31" }).success,
    ).toBe(false));
  it("requires inquiry consent and a clear description", () =>
    expect(
      inquirySchema.safeParse({
        name: "A",
        email: "bad",
        description: "x",
        consent: false,
      }).success,
    ).toBe(false));
  it("rejects invalid URL slugs", () =>
    expect(
      moduleSchema(modules.services).partial().safeParse({ slug: "../../bad" })
        .success,
    ).toBe(false));
  it("bounds project progress", () =>
    expect(
      moduleSchema(modules.projects).partial().safeParse({ progress: 101 })
        .success,
    ).toBe(false));
});
