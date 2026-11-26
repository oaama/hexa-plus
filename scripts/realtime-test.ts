import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import assert from "node:assert/strict";
process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(url, process.env.SUPABASE_SERVER_KEY!, opts);
const users: string[] = [];
for (const role of ["admin", "team_member"]) {
  const email = `hexa-qa-${Date.now()}-${role}@example.invalid`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (error) throw error;
  users.push(data.user!.id);
  const { data: r } = await service
    .from("roles")
    .select("id")
    .eq("name", role)
    .single();
  const { error: pe } = await service.from("profiles").insert({
    id: data.user!.id,
    name: "TEST Realtime",
    email,
    role_id: r!.id,
    status: "active",
  });
  if (pe) throw pe;
}
console.log("Realtime run opened", new Date().toISOString(), users);
const clients = [];
const events: string[][] = [[], []];
const channels = [];
const ids: string[] = [];
try {
  for (let i = 0; i < 2; i++) {
    const u = await service.auth.admin.getUserById(users[i]);
    const { data, error } = await service.auth.admin.generateLink({
      type: "magiclink",
      email: u.data.user!.email!,
    });
    if (error) throw error;
    const db = createClient(url, key, opts);
    const session = await db.auth.verifyOtp({
      type: "magiclink",
      token_hash: data.properties!.hashed_token,
    });
    if (session.error) throw session.error;
    await db.realtime.setAuth(session.data.session!.access_token);
    clients.push(db);
    const c = db
      .channel("qa-isolation-" + i)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => events[i].push(String(payload.new.id)),
      );
    channels.push(c);
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Postgres listener readiness timeout")),
        35000,
      );
      c.on("system", {}, (payload) => {
        console.log("SYSTEM", i, JSON.stringify(payload));
        if (
          payload.extension === "postgres_changes" &&
          payload.status === "ok"
        ) {
          clearTimeout(timer);
          resolve();
        }
      });
      c.subscribe((status, err) => {
        console.log("CHANNEL", i, status, err?.message || "");
        if (status === "CHANNEL_ERROR") {
          clearTimeout(timer);
          reject(err || new Error("channel error"));
        }
      });
    });
  }
  for (let i = 0; i < 2; i++) {
    const { data, error } = await service
      .from("notifications")
      .insert({
        recipient_id: users[i],
        title: "TEST Realtime isolation " + i,
        body: "TEST ONLY",
        link: "/dashboard/notifications",
      })
      .select("id")
      .single();
    if (error) throw error;
    ids.push(data!.id);
  }
  for (let i = 0; i < 100; i++) {
    if (events[0].includes(ids[0]) && events[1].includes(ids[1])) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  await new Promise((r) => setTimeout(r, 600));
  assert.ok(
    events[0].includes(ids[0]),
    "First recipient did not receive its event",
  );
  assert.ok(
    events[1].includes(ids[1]),
    "Second recipient did not receive its event",
  );
  assert.ok(
    !events[0].includes(ids[1]),
    "First recipient saw second recipient data",
  );
  assert.ok(
    !events[1].includes(ids[0]),
    "Second recipient saw first recipient data",
  );
  console.log(
    "PASS two authenticated WebSocket sessions receive only their own notifications.",
  );
} catch (e) {
  console.error("REALTIME TEST FAILED", e instanceof Error ? e.message : e);
  process.exitCode = 1;
} finally {
  console.log("Holding channels for inspection", new Date().toISOString());
  await new Promise((r) => setTimeout(r, 60000));
  if (ids.length) await service.from("notifications").delete().in("id", ids);
  for (let i = 0; i < clients.length; i++)
    await clients[i].removeChannel(channels[i]);
  for (const id of users) {
    await service.from("notifications").delete().eq("recipient_id", id);
    await service.from("activity_logs").delete().eq("actor_id", id);
    await service.auth.admin.deleteUser(id);
  }
}
process.exit(process.exitCode || 0);
