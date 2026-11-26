import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import fs from "node:fs";
import assert from "node:assert/strict";
process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serverKey = process.env.SUPABASE_SERVER_KEY!;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(url, serverKey, opts);
const anon = createClient(url, key, opts);
const suffix = Date.now();
const userIds: string[] = [];
const rows: Record<string, string[]> = {};
let passed = 0;
const report = (name: string) => {
  passed++;
  console.log("PASS", name);
};
const add = async (
  db: SupabaseClient,
  table: string,
  values: Record<string, any>,
) => {
  const { data, error } = await db.from(table).insert(values).select().single();
  assert.equal(error, null, table + ": " + error?.message);
  (rows[table] ??= []).push(data.id);
  return data;
};
async function makeUser(role: string) {
  const email = `hexa-qa-${suffix}-${role}@example.invalid`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name: "TEST " + role },
  });
  assert.equal(error, null);
  const user = data.user!;
  userIds.push(user.id);
  const { data: r } = await service
    .from("roles")
    .select("id")
    .eq("name", role)
    .single();
  const { error: pe } = await service.from("profiles").insert({
    id: user.id,
    name: "TEST " + role,
    email,
    role_id: r!.id,
    status: "active",
  });
  assert.equal(pe, null, pe?.message);
  const { data: link, error: le } = await service.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  assert.equal(le, null);
  const db = createClient(url, key, opts);
  const { data: session, error: se } = await db.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties!.hashed_token,
  });
  assert.equal(se, null, se?.message);
  return { db, user, session: session.session! };
}
async function cleanup() {
  for (const table of [
    "payments",
    "invoice_items",
    "invoices",
    "task_attachments",
    "task_comments",
    "project_milestones",
    "project_members",
    "tasks",
    "portfolio_media",
    "portfolio_projects",
    "content_posts",
    "marketing_campaigns",
    "social_accounts",
    "expenses",
    "files",
    "lead_activities",
    "contact_submissions",
    "leads",
    "projects",
    "clients",
    "services",
    "website_settings",
    "testimonials",
  ]) {
    if (rows[table]?.length) {
      const { error } = await service
        .from(table)
        .delete()
        .in("id", rows[table]);
      if (error) console.log("CLEANUP NOTE", table, error.message);
    }
  }
  for (const uid of userIds) {
    await service.from("notifications").delete().eq("recipient_id", uid);
    await service.from("activity_logs").delete().eq("actor_id", uid);
    await service.auth.admin.deleteUser(uid);
  }
  await service.storage
    .from("portfolio")
    .remove(["qa/client1.png", "qa/client_.png"]);
}
async function main() {
  const { data: pub, error: ve } = await anon
    .from("published_services")
    .select("*");
  assert.equal(ve, null, ve?.message);
  assert.equal(pub!.length, 20);
  report("anonymous service publication view");
  for (const t of [
    "clients",
    "leads",
    "profiles",
    "invoices",
    "services",
    "website_settings",
  ]) {
    const { error } = await anon.from(t).select("*");
    assert.ok(error, "Anon must not read " + t);
  }
  report("anonymous private/base-table access denied");
  const admin = await makeUser("admin"),
    team = await makeUser("team_member"),
    superUser = await makeUser("super_admin");
  report("real Auth JWTs for admin, team member and super admin");
  const client = await add(admin.db, "clients", {
    name: "TEST Client " + suffix,
    company: "TEST ONLY",
    email: "test@example.invalid",
    status: "active",
  });
  const p1 = await add(admin.db, "projects", {
      name: "TEST Assigned project",
      client_id: client.id,
      status: "in_progress",
      progress: 20,
    }),
    p2 = await add(admin.db, "projects", {
      name: "TEST Unrelated project",
      client_id: client.id,
      status: "planning",
    });
  await add(admin.db, "project_members", {
    project_id: p1.id,
    profile_id: team.user.id,
  });
  const m1 = await add(admin.db, "project_milestones", {
      name: "TEST Visible milestone",
      project_id: p1.id,
      status: "planned",
    }),
    m2 = await add(admin.db, "project_milestones", {
      name: "TEST Private milestone",
      project_id: p2.id,
      status: "planned",
    });
  const task = await add(admin.db, "tasks", {
    title: "TEST Assigned task",
    project_id: p1.id,
    assigned_to: team.user.id,
    status: "to_do",
    priority: "normal",
  });
  const hiddenTask = await add(admin.db, "tasks", {
    title: "TEST Unrelated task",
    project_id: p2.id,
    status: "to_do",
  });
  const own = await team.db
    .from("projects")
    .select("id")
    .in("id", [p1.id, p2.id]);
  assert.deepEqual(
    own.data?.map((v) => v.id),
    [p1.id],
  );
  const milestones = await team.db
    .from("project_milestones")
    .select("id")
    .in("id", [m1.id, m2.id]);
  assert.deepEqual(
    milestones.data?.map((v) => v.id),
    [m1.id],
  );
  const members = await team.db
    .from("project_members")
    .select("project_id")
    .in("project_id", [p1.id, p2.id]);
  assert.ok(members.data?.every((v) => v.project_id === p1.id));
  report("cross-project parent, milestone and member RLS");
  const { error: st } = await team.db.rpc("set_task_status", {
    task: task.id,
    next_status: "in_progress",
  });
  assert.equal(st, null, st?.message);
  const { error: hs } = await team.db.rpc("set_task_status", {
    task: hiddenTask.id,
    next_status: "completed",
  });
  assert.ok(hs);
  const profileAttack = await team.db
    .from("profiles")
    .update({
      role_id: (
        await service
          .from("roles")
          .select("id")
          .eq("name", "super_admin")
          .single()
      ).data!.id,
    })
    .eq("id", team.user.id)
    .select();
  assert.equal(profileAttack.data?.length || 0, 0);
  report("assigned-only task status and no role escalation");
  const items = [
    {
      description: "TEST line — أنجيلو رزق",
      quantity: 2,
      unit_price_minor: 5000,
    },
  ];
  const header = {
    invoice_number: "TEST-" + suffix,
    client_id: client.id,
    project_id: p1.id,
    issue_date: "2026-11-21",
    due_date: "2026-11-30",
    tax_bps: 0,
    notes: "TEST invoice, remove after verification.",
  };
  const invoice = await admin.db.rpc("save_invoice", {
    record_id: null,
    header,
    items,
  });
  assert.equal(invoice.error, null, invoice.error?.message);
  (rows.invoices ??= []).push(invoice.data);
  const id = invoice.data;
  const iv = await admin.db.from("invoices").select("*").eq("id", id).single();
  assert.equal(Number(iv.data?.total_minor), 10000);
  report("transactional invoice create with exact integer totals");
  const nil = await admin.db.rpc("save_invoice", {
    record_id: id,
    header,
    items: null,
  });
  assert.ok(nil.error);
  const direct = await admin.db
    .from("invoices")
    .update({ total_minor: 1 })
    .eq("id", id);
  assert.ok(direct.error);
  const directItem = await admin.db
    .from("invoice_items")
    .delete()
    .eq("invoice_id", id);
  assert.ok(directItem.error);
  report("NULL item rejection and direct financial mutation denial");
  const concurrent = await Promise.all(
    [1, 2].map(() =>
      admin.db
        .from("payments")
        .insert({
          invoice_id: id,
          amount_minor: 7000,
          paid_at: "2026-11-21",
          method: "cash",
        })
        .select("id"),
    ),
  );
  assert.equal(
    concurrent.filter((r) => !r.error).length,
    1,
    JSON.stringify(concurrent.map((r) => r.error?.message)),
  );
  for (const result of concurrent)
    for (const v of result.data || []) (rows.payments ??= []).push(v.id);
  const paidEdit = await admin.db.rpc("save_invoice", {
    record_id: id,
    header,
    items,
  });
  assert.ok(paidEdit.error);
  report(
    "real-JWT payment succeeds; concurrent overpayment blocked; paid invoice immutable",
  );
  const svc = await add(superUser.db, "services", {
    name: "TEST publication",
    slug: "test-" + suffix,
    division: "digital",
    description: "TEST ONLY",
    pricing: "QA hidden pricing",
    show_pricing: false,
    published: true,
  });
  const safe = await anon
    .from("published_services")
    .select("*")
    .eq("id", svc.id)
    .single();
  assert.equal(safe.data?.pricing, null);
  assert.ok(!("created_by" in safe.data!));
  const safeTeam = await team.db
    .from("published_services")
    .select("*")
    .eq("id", svc.id)
    .single();
  assert.equal(safeTeam.data?.pricing, null);
  report(
    "hidden pricing and staff metadata excluded for anon and ordinary user",
  );
  const portfolio = await add(superUser.db, "portfolio_projects", {
    title: "TEST Published media",
    slug: "test-media-" + suffix,
    thumbnail_url: url + "/storage/v1/object/public/portfolio/qa/client1.png",
    published: true,
  });
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  );
  for (const name of ["qa/client1.png", "qa/client_.png"]) {
    const { error } = await service.storage
      .from("portfolio")
      .upload(name, png, { contentType: "image/png", upsert: true });
    assert.equal(error, null, error?.message);
  }
  assert.equal(
    (await anon.storage.from("portfolio").download("qa/client1.png")).error,
    null,
  );
  for (const name of [
    "qa/client_.png",
    "qa/nested/percent%.png",
    "external/qa/client1.png",
  ])
    assert.ok((await anon.storage.from("portfolio").download(name)).error);
  await superUser.db
    .from("portfolio_projects")
    .update({ published: false })
    .eq("id", portfolio.id);
  assert.ok(
    (await anon.storage.from("portfolio").download("qa/client1.png")).error,
  );
  report(
    "published media readable; draft, wildcard, nested and unpublished media denied",
  );
  for (const [table, values] of [
    ["leads", { name: "TEST Lead", email: "qa@example.invalid", stage: "new" }],
    ["lead_activities", { lead_id: null, body: "TEST Call", kind: "call" }],
    ["task_comments", { task_id: task.id, body: "TEST Comment" }],
    [
      "content_posts",
      {
        title: "TEST Content",
        platform: "website",
        status: "draft",
        client_id: client.id,
      },
    ],
    [
      "marketing_campaigns",
      { name: "TEST Campaign", client_id: client.id, status: "planned" },
    ],
    [
      "social_accounts",
      {
        name: "TEST Social",
        platform: "website",
        url: "https://example.com",
        client_id: client.id,
      },
    ],
    [
      "expenses",
      { name: "TEST Expense", amount_minor: 12345, expense_date: "2026-11-21" },
    ],
    [
      "website_settings",
      { key: "test-" + suffix, value: "TEST", is_public: false },
    ],
    [
      "testimonials",
      {
        name: "TEST Not real",
        quote: "TEST ONLY, never publish.",
        published: false,
      },
    ],
  ] as [string, Record<string, any>][]) {
    if (table === "lead_activities") values.lead_id = rows.leads[0];
    const record = await add(superUser.db, table, values);
    const update = await superUser.db
      .from(table)
      .update(
        table === "leads"
          ? { company: "TEST Changed" }
          : table === "lead_activities" || table === "task_comments"
            ? { body: "TEST Edited" }
            : table === "content_posts"
              ? { caption: "TEST Edited" }
              : table === "marketing_campaigns" ||
                  table === "social_accounts" ||
                  table === "expenses"
                ? { notes: "TEST Edited" }
                : table === "website_settings"
                  ? { value: "TEST Edited" }
                  : { quote: "TEST Edited, never publish." },
      )
      .eq("id", record.id)
      .select("id");
    assert.equal(update.error, null, table + ": " + update.error?.message);
    assert.equal(update.data?.length, 1);
  }
  report(
    "CRM, lead activity, tasks, marketing, expenses, settings and testimonial CRUD",
  );
  const overview = await admin.db.rpc("dashboard_overview");
  assert.equal(overview.error, null, overview.error?.message);
  assert.ok(overview.data.stats.clients >= 1);
  assert.equal(overview.data.months.length, 6);
  report("analytics from actual database records");
  const cookies: any[] = [];
  const ssr = createServerClient(url, key, {
    cookies: {
      getAll: () => cookies,
      setAll: (items) => {
        for (const c of items) {
          const i = cookies.findIndex((v) => v.name === c.name);
          if (i >= 0) cookies[i] = c;
          else cookies.push(c);
        }
      },
    },
  });
  await ssr.auth.setSession({
    access_token: superUser.session.access_token,
    refresh_token: superUser.session.refresh_token,
  });
  fs.writeFileSync(
    "/tmp/hexa-test-session.json",
    JSON.stringify({
      cookies,
      userId: superUser.user.id,
      invoiceId: id,
      clientId: client.id,
      projectId: p1.id,
    }),
    { mode: 0o600 },
  );
  fs.writeFileSync(
    "/tmp/hexa-test-cleanup.json",
    JSON.stringify({ rows, userIds }),
    { mode: 0o600 },
  );
  console.log("PASS TOTAL", passed);
  console.log(
    "Temporary QA records retained only for the immediately following browser/PDF checks. Run cleanup-test.ts afterward.",
  );
}
main()
  .then(() => process.exit(0))
  .catch(async (e) => {
    console.error("TEST FAILED", e.message);
    await cleanup();
    process.exit(1);
  });
