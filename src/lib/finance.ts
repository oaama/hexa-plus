import { z } from "zod";
export const invoiceLine = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().min(1).max(100000),
  unit_price_minor: z.number().int().min(0).max(100000000),
});
export function invoiceTotals(
  items: z.infer<typeof invoiceLine>[],
  taxBasisPoints = 0,
) {
  z.array(invoiceLine).min(1).max(100).parse(items);
  z.number().int().min(0).max(10000).parse(taxBasisPoints);
  const subtotal = items.reduce(
    (a, i) => a + i.quantity * i.unit_price_minor,
    0,
  );
  if (!Number.isSafeInteger(subtotal))
    throw new Error("Invoice total is too large");
  const tax = Math.round((subtotal * taxBasisPoints) / 10000);
  return { subtotal, tax, total: subtotal + tax };
}
export function money(minor: number, currency = "EGP", locale = "en-EG") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    minor / 100,
  );
}
