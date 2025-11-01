import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

app.get("/", (req, res) => {
  res.send("✅ Backend running !");
});

app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now;");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend started on port ${PORT}`));

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Bootstrap admin (already existing)
app.post("/api/admin/bootstrap", async (req, res) => {
  const token = req.headers["x-setup-token"];
  if (
    !process.env.ADMIN_SETUP_TOKEN ||
    token !== process.env.ADMIN_SETUP_TOKEN
  ) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  let userId = created?.user?.id;

  if (!userId && createError) {
    const { data: list, error: listError } =
      await supabase.auth.admin.listUsers();
    if (listError) return res.status(500).json({ error: listError.message });
    const existing = list.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (!existing) return res.status(500).json({ error: createError.message });
    userId = existing.id;
  }

  const { data: updated, error: updateError } =
    await supabase.auth.admin.updateUserById(userId, {
      app_metadata: { role: "admin" },
    });
  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.json({ ok: true, userId });
});

// ---------- Invitations ----------
// Helper: ensure tables exist (best-effort)
async function ensureInvitationTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.invitations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL,
        token text UNIQUE NOT NULL,
        status text NOT NULL CHECK (status IN ('pending','renew_requested','cancelled','accepted','expired','sent')),
        invited_by uuid NOT NULL,
        role text NOT NULL DEFAULT 'player',
        created_at timestamptz NOT NULL DEFAULT now(),
        expires_at timestamptz NOT NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        type text NOT NULL,
        message text NOT NULL,
        recipient_user_id uuid NOT NULL,
        related_invitation_id uuid,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  } catch (e) {
    console.warn("ensureInvitationTables skipped:", e?.message || e);
  }
}

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

// Create invitation
app.post("/api/invitations", async (req, res) => {
  const { email, role = "player", invitedBy } = req.body;
  if (!email || !invitedBy) {
    return res.status(400).json({ error: "email and invitedBy required" });
  }
  await ensureInvitationTables();

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h

  try {
    const insert = await pool.query(
      `INSERT INTO public.invitations (email, token, status, invited_by, role, expires_at)
       VALUES ($1, $2, 'pending', $3, $4, $5)
       RETURNING id, token, expires_at`,
      [email, token, invitedBy, role, expiresAt]
    );
    const inv = insert.rows[0];
    const inviteLink = `${process.env.APP_BASE_URL || "http://localhost:5173"}/invite/${inv.token}`;

    // TODO: send email via SMTP provider; for now, log link
    console.log("[Invite link]", inviteLink);

    return res.json({ ok: true, id: inv.id, token: inv.token, expires_at: inv.expires_at, link: inviteLink });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// Get invitation by token
app.get("/api/invitations/:token", async (req, res) => {
  const { token } = req.params;
  await ensureInvitationTables();
  try {
    const result = await pool.query(
      `SELECT * FROM public.invitations WHERE token = $1`,
      [token]
    );
    const inv = result.rows[0];
    if (!inv) return res.status(404).json({ error: "Invitation not found" });

    const now = Date.now();
    const expired = new Date(inv.expires_at).getTime() < now;
    return res.json({ ...inv, expired });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// Request renewal when token expired
app.post("/api/invitations/:token/request-renewal", async (req, res) => {
  const { token } = req.params;
  await ensureInvitationTables();
  try {
    const { rows } = await pool.query(
      `UPDATE public.invitations SET status = 'renew_requested' WHERE token = $1 RETURNING id, invited_by, email`,
      [token]
    );
    const inv = rows[0];
    if (!inv) return res.status(404).json({ error: "Invitation not found" });

    // Notify inviting coach
    await pool.query(
      `INSERT INTO public.notifications (type, message, recipient_user_id, related_invitation_id)
       VALUES ('invite_renewal_request', $1, $2, $3)`,
      [
        `Demande de nouveau lien pour ${inv.email}`,
        inv.invited_by,
        inv.id,
      ]
    );

    // Notify all admins
    const { data: list } = await supabase.auth.admin.listUsers();
    const admins = (list?.users || []).filter((u) => (u?.app_metadata?.role) === 'admin');
    for (const a of admins) {
      await pool.query(
        `INSERT INTO public.notifications (type, message, recipient_user_id, related_invitation_id)
         VALUES ('invite_renewal_request', $1, $2, $3)`,
        [
          `Demande de nouveau lien pour ${inv.email}`,
          a.id,
          inv.id,
        ]
      );
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// Approve renewal: new token, new expiry
app.post("/api/invitations/:id/approve-renewal", async (req, res) => {
  const { id } = req.params;
  await ensureInvitationTables();
  try {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { rows } = await pool.query(
      `UPDATE public.invitations SET token = $1, expires_at = $2, status = 'pending' WHERE id = $3
       RETURNING email, token, expires_at`,
      [token, expiresAt, id]
    );
    const inv = rows[0];
    if (!inv) return res.status(404).json({ error: "Invitation not found" });

    const inviteLink = `${process.env.APP_BASE_URL || "http://localhost:5173"}/invite/${inv.token}`;
    console.log("[Invite renewed link]", inviteLink);

    return res.json({ ok: true, token: inv.token, expires_at: inv.expires_at, link: inviteLink });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// Accept invitation (after successful signup)
app.post("/api/invitations/:id/accept", async (req, res) => {
  const { id } = req.params;
  await ensureInvitationTables();
  try {
    const { rowCount } = await pool.query(
      `UPDATE public.invitations SET status = 'accepted' WHERE id = $1`,
      [id]
    );
    if (!rowCount) return res.status(404).json({ error: "Invitation not found" });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// Cancel invitation
app.post("/api/invitations/:id/cancel", async (req, res) => {
  const { id } = req.params;
  await ensureInvitationTables();
  try {
    const { rowCount } = await pool.query(
      `UPDATE public.invitations SET status = 'cancelled' WHERE id = $1`,
      [id]
    );
    if (!rowCount) return res.status(404).json({ error: "Invitation not found" });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
});

// List notifications for a recipient
app.get("/api/notifications", async (req, res) => {
  const recipient = req.query.recipient;
  await ensureInvitationTables();
  if (!recipient) return res.status(400).json({ error: 'recipient required' });
  try {
    const { rows } = await pool.query(
      `SELECT * FROM public.notifications WHERE recipient_user_id = $1 ORDER BY created_at DESC`,
      [recipient]
    );
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || 'Server error' });
  }
});
