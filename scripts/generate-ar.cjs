const ts = require("typescript"),
  fs = require("fs"),
  path = require("path");
const dict = Object.fromEntries(
  fs
    .readFileSync("src/lib/ar-copy.tsv", "utf8")
    .trim()
    .split("\n")
    .map((l) => l.split("\t")),
);
fs.writeFileSync("src/lib/ar-copy.json", JSON.stringify(dict, null, 2));
const routes = [
  "/",
  "/services",
  "/portfolio",
  "/contact",
  "/about",
  "/industries",
  "/process",
  "/careers",
  "/faq",
  "/privacy",
  "/terms",
];
function tr(v) {
  if (dict[v]) return dict[v];
  if (
    v.startsWith("/") &&
    routes.some(
      (r) =>
        r !== "/" &&
        (v === r ||
          v.startsWith(r + "/") ||
          v.startsWith(r + "?") ||
          v.startsWith(r + "#")),
    )
  )
    return "/ar" + v;
  if (v === "/") return "/ar";
  return v;
}
function convert(file, dest) {
  const s = fs.readFileSync(file, "utf8"),
    sf = ts.createSourceFile(
      file,
      s,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    ),
    changes = [];
  function walk(n) {
    if (ts.isJsxText(n)) {
      const text = n.text.replace(/\s+/g, " ").trim();
      if (dict[text]) changes.push([n.pos, n.end, " " + dict[text] + " "]);
    } else if (ts.isStringLiteral(n)) {
      let v = tr(n.text);
      const imports = {
        "@/lib/public-data": "@/lib/public-data-ar",
        "@/components/inquiry-form": "@/components/inquiry-form-ar",
        "@/components/project-gallery": "@/components/project-gallery-ar",
        "@/lib/validation": "@/lib/validation-ar",
      };
      v = imports[v] || v;
      if (v !== n.text)
        changes.push([n.getStart(sf), n.end, JSON.stringify(v)]);
    }
    ts.forEachChild(n, walk);
  }
  walk(sf);
  let out = s;
  for (const [a, b, c] of changes.sort((x, y) => y[0] - x[0]))
    out = out.slice(0, a) + c + out.slice(b);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out);
}
function dir(p) {
  for (const f of fs.readdirSync(p, { withFileTypes: true })) {
    if (f.name === "ar") continue;
    const file = path.join(p, f.name);
    if (f.isDirectory()) dir(file);
    else if (f.name === "page.tsx" && file !== "src/app/(public)/page.tsx")
      convert(file, file.replace("src/app/(public)/", "src/app/(public)/ar/"));
  }
}
dir("src/app/(public)");
for (const f of [
  "site-header",
  "site-footer",
  "inquiry-form",
  "project-gallery",
])
  convert("src/components/" + f + ".tsx", "src/components/" + f + "-ar.tsx");
convert("src/lib/validation.ts", "src/lib/validation-ar.ts");

const ah = "src/components/site-header-ar.tsx";
fs.writeFileSync(
  ah,
  fs
    .readFileSync(ah, "utf8")
    .replace(
      /<a\s+className="language-switch"[\s\S]*?<\/a>/,
      '<a className="language-switch" href={pathname.replace(/^\\/ar(?=\\/|$)/, "") || "/"} lang="en" aria-label="View in English">English</a>',
    ),
);
const cp = "src/app/(public)/ar/portfolio/[slug]/page.tsx";
fs.writeFileSync(
  cp,
  fs
    .readFileSync(cp, "utf8")
    .replace("const { data: p }", "const { data: raw }")
    .replace(
      "if (!p) notFound();",
      "if (!raw) notFound();\n const p={...raw,title:raw.title_ar||raw.title,description:raw.description_ar||raw.description,category:raw.category_ar||raw.category,industry:raw.industry_ar||raw.industry,challenge:raw.challenge_ar||raw.challenge,solution:raw.solution_ar||raw.solution,results:raw.results_ar||raw.results,services_provided:raw.services_provided_ar||raw.services_provided};",
    ),
);
const form = "src/components/inquiry-form-ar.tsx";
let content = fs.readFileSync(form, "utf8");
content = content.replace("result.error ||", "");
content = content.replace(
  'e instanceof Error ? e.message : "تعذر حفظ استفسارك."',
  '"تعذر حفظ استفسارك. راجع اتصالك وحاول مرة أخرى."',
);
content = content.replace(
  /\{errors\[key\]\?\.message\}/g,
  '{/[^\\x00-\\x7F]/.test(String(errors[key]?.message))?errors[key]?.message:"راجع البيانات المدخلة في هذا الحقل."}',
);
fs.writeFileSync(form, content);

const av = "src/lib/validation-ar.ts";
fs.writeFileSync(
  av,
  fs
    .readFileSync(av, "utf8")
    .replace(
      /\.max\((200|254|80|100|10000)\)/g,
      '.max($1, "النص أطول من الحد المسموح.")',
    ),
);
