import reshaper from "arabic-persian-reshaper";
import bidiFactory from "bidi-js";
import { NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { apiUser, apiError } from "@/lib/api";
import { money } from "@/lib/finance";
import { z } from "zod";
async function asset(request: Request, file: string) {
  try {
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    return await readFile(path.join(process.cwd(), "public", file));
  } catch {
    const r = await fetch(new URL("/" + file, request.url));
    if (!r.ok) throw new Error("Asset unavailable.");
    return new Uint8Array(await r.arrayBuffer());
  }
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    z.uuid().parse(id);
    const { db } = await apiUser("finance.read");
    const { data: invoice, error } = await db
      .from("invoices")
      .select("*,clients(name,company,email,phone)")
      .eq("id", id)
      .single();
    if (error || !invoice) throw new Error("Invoice not found.");
    const [
      { data: items, error: ie },
      { data: payments, error: pe },
      { data: settings },
    ] = await Promise.all([
      db
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", id)
        .order("sort_order"),
      db.from("payments").select("amount_minor").eq("invoice_id", id),
      db
        .from("website_settings")
        .select("key,value")
        .in("key", ["address", "contact_email", "contact_phone"]),
    ]);
    if (ie || pe) throw new Error("Could not load invoice details.");
    const company = Object.fromEntries(
      (settings || []).map((s) => [s.key, s.value]),
    );
    const pdf = await PDFDocument.create();
    pdf.registerFontkit(fontkit);
    const font = await pdf.embedFont(
      await asset(request, "fonts/DejaVuSans.ttf"),
      { subset: true },
    );
    const logo = await pdf.embedPng(await asset(request, "hexa-mark.png"));
    const navy = rgb(0.035, 0.065, 0.14),
      ink = rgb(0.1, 0.15, 0.25),
      muted = rgb(0.4, 0.46, 0.56),
      blue = rgb(0.28, 0.36, 0.76),
      line = rgb(0.86, 0.88, 0.92);
    let page = pdf.addPage([595.28, 841.89]);
    let y = 0;
    const left = 42,
      right = 553;
    const bidi = bidiFactory();
    const visual = (text: string) => {
      if (!/[\u0600-\u06ff]/.test(text)) return text;
      const shaped = reshaper.ArabicShaper.convertArabic(text);
      return bidi.getReorderedString(
        shaped,
        bidi.getEmbeddingLevels(shaped, "ltr"),
      );
    };
    const draw = (
      text: string,
      x: number,
      yp: number,
      size = 10,
      color = ink,
    ) =>
      page.drawText(visual(String(text || "")), {
        x,
        y: yp,
        size,
        font,
        color,
      });
    const rule = (yp: number) =>
      page.drawLine({
        start: { x: left, y: yp },
        end: { x: right, y: yp },
        thickness: 0.6,
        color: line,
      });
    const wrap = (text: string, width: number, size: number) => {
      const out: string[] = [];
      for (const paragraph of String(text || "").split("\n")) {
        let current = "";
        for (const word of paragraph.split(" ")) {
          if (
            font.widthOfTextAtSize(
              current ? current + " " + word : word,
              size,
            ) > width &&
            current
          ) {
            out.push(current);
            current = word;
          } else current = current ? current + " " + word : word;
        }
        out.push(current);
      }
      return out;
    };
    const alignRight = (
      text: string,
      x: number,
      yp: number,
      size = 10,
      color = ink,
    ) => draw(text, x - font.widthOfTextAtSize(text, size), yp, size, color);
    const header = () => {
      page.drawRectangle({
        x: 0,
        y: 697,
        width: 595.28,
        height: 145,
        color: navy,
      });
      page.drawImage(logo, { x: left, y: 721, width: 77, height: 80 });
      draw("HEXA PLUS", 139, 774, 19, rgb(1, 1, 1));
      draw("DIGITAL SOLUTIONS + MARKETING", 139, 752, 7, rgb(0.67, 0.72, 0.85));
      alignRight("INVOICE", right, 775, 20, rgb(1, 1, 1));
      alignRight(invoice.invoice_number, right, 752, 10, rgb(0.7, 0.77, 0.95));
      y = 664;
    };
    const footer = () => {
      rule(55);
      draw(
        "HEXA PLUS · " + (company.address || "Minya, Egypt"),
        left,
        38,
        8,
        muted,
      );
      alignRight("Generated from saved business records", right, 38, 7, muted);
    };
    const tableHead = () => {
      page.drawRectangle({
        x: left,
        y: y - 27,
        width: right - left,
        height: 30,
        color: rgb(0.94, 0.95, 0.98),
      });
      draw("DESCRIPTION", left + 10, y - 15, 8, muted);
      alignRight("QTY", 375, y - 15, 8, muted);
      alignRight("UNIT PRICE", 465, y - 15, 8, muted);
      alignRight("AMOUNT", right - 10, y - 15, 8, muted);
      y -= 43;
    };
    header();
    draw("BILL TO", left, y, 8, blue);
    draw("ISSUE DATE", 365, y, 7, muted);
    draw("DUE DATE", 470, y, 7, muted);
    y -= 21;
    draw(invoice.clients?.name || "Client", left, y, 12);
    draw(invoice.issue_date, 365, y, 9);
    draw(invoice.due_date, 470, y, 9);
    y -= 18;
    for (const text of [
      invoice.clients?.company,
      invoice.clients?.email,
      invoice.clients?.phone,
    ].filter(Boolean)) {
      draw(text, left, y, 9, muted);
      y -= 15;
    }
    y = Math.min(y - 30, 555);
    tableHead();
    for (const item of items || []) {
      const lines = wrap(item.description, 280, 9);
      const height = Math.max(35, lines.length * 14 + 18);
      if (y - height < 180) {
        footer();
        page = pdf.addPage([595.28, 841.89]);
        header();
        tableHead();
      }
      lines.forEach((text, idx) => draw(text, left + 10, y - idx * 14, 9));
      alignRight(String(item.quantity), 375, y, 9);
      alignRight(money(Number(item.unit_price_minor)), 465, y, 8);
      alignRight(
        money(Number(item.quantity) * Number(item.unit_price_minor)),
        right - 10,
        y,
        8,
      );
      y -= height;
      rule(y + 12);
    }
    if (y < 230) {
      footer();
      page = pdf.addPage([595.28, 841.89]);
      header();
    }
    y -= 15;
    const paid = (payments || []).reduce(
      (a, p) => a + Number(p.amount_minor),
      0,
    );
    for (const [label, value] of [
      ["Subtotal", invoice.subtotal_minor],
      ["Tax (" + Number(invoice.tax_bps) / 100 + "%)", invoice.tax_minor],
      ["Total", invoice.total_minor],
      ["Payments recorded", paid],
      ["Amount due", Math.max(0, Number(invoice.total_minor) - paid)],
    ] as [string, number][]) {
      const bold = label === "Total" || label === "Amount due";
      draw(label, 320, y, bold ? 10 : 9, bold ? ink : muted);
      alignRight(
        money(Number(value)),
        right - 10,
        y,
        bold ? 11 : 9,
        bold ? blue : ink,
      );
      y -= 25;
    }
    if (invoice.notes) {
      y -= 15;
      draw("NOTES", left, y, 8, blue);
      y -= 18;
      for (const text of wrap(invoice.notes, 480, 8).slice(0, 6)) {
        draw(text, left, y, 8, muted);
        y -= 12;
      }
    }
    footer();
    const pages = pdf.getPages();
    pages.forEach((p, i) =>
      p.drawText(`${i + 1} / ${pages.length}`, {
        x: 280,
        y: 18,
        size: 6,
        font,
        color: muted,
      }),
    );
    pdf.setTitle("HEXA PLUS Invoice " + invoice.invoice_number);
    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="HEXA-${invoice.invoice_number.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
