import { z } from "zod";
import type { Module } from "./modules";
export const inquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اكتب اسمك الكامل.")
    .max(200, "النص أطول من الحد المسموح."),
  company: z.string().trim().max(200, "النص أطول من الحد المسموح.").optional(),
  email: z
    .email("اكتب بريدًا إلكترونيًا صحيحًا.")
    .max(254, "النص أطول من الحد المسموح."),
  phone: z
    .string()
    .trim()
    .min(7, "اكتب رقم تواصل صحيحًا.")
    .max(80, "النص أطول من الحد المسموح."),
  service: z
    .string()
    .trim()
    .min(1, "اختر الخدمة المطلوبة.")
    .max(200, "النص أطول من الحد المسموح."),
  budget: z.string().max(100, "النص أطول من الحد المسموح.").optional(),
  timeline: z.string().max(100, "النص أطول من الحد المسموح.").optional(),
  description: z
    .string()
    .trim()
    .min(20, "أخبرنا بالمزيد، ٢٠ حرفًا على الأقل.")
    .max(10000, "النص أطول من الحد المسموح."),
  website: z.string().max(0),
  consent: z.boolean().refine((v) => v, "يُرجى الموافقة على سياسة الخصوصية."),
});
export type InquiryInput = z.infer<typeof inquirySchema>;
export function moduleSchema(module: Module) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of module.fields) {
    let rule: z.ZodType;
    if (f.type === "boolean") rule = z.boolean();
    else if (["number", "money", "percent"].includes(f.type))
      rule = z
        .number()
        .int()
        .min(f.min ?? 0)
        .max(f.max ?? (f.type === "percent" ? 10000 : 1000000000000));
    else if (f.type === "relation")
      rule = f.required ? z.uuid() : z.union([z.uuid(), z.null()]);
    else if (f.type === "select")
      rule = z.enum(f.options as [string, ...string[]]);
    else if (f.type === "date")
      rule = f.required ? z.iso.date() : z.union([z.iso.date(), z.null()]);
    else if (f.type === "email")
      rule = f.required
        ? z.email().max(254, "النص أطول من الحد المسموح.")
        : z.union([z.email().max(254, "النص أطول من الحد المسموح."), z.null()]);
    else if (f.type === "url")
      rule = z.union([
        z
          .url()
          .refine(
            (v) => /^https:\/\//.test(v),
            "Only HTTPS URLs are accepted.",
          ),
        z.null(),
      ]);
    else
      rule = f.required
        ? z
            .string()
            .trim()
            .min(1)
            .max(f.key === "description" ? 10000 : 4000)
        : z.string().trim().max(10000, "النص أطول من الحد المسموح.").nullable();
    if (f.key === "slug")
      rule = z
        .string()
        .min(1)
        .max(160)
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Use lower-case words separated by hyphens.",
        );
    shape[f.key] = rule;
  }
  return z.object(shape).strict();
}
