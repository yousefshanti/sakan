-- ═══════════════════════════════════════════════════════════════════════════
--  مصاريف السكن — Supabase Schema
--  Run this once in the Supabase SQL Editor before using the app.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. settings  (stores roommates list as JSON) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.settings (
    key        TEXT        PRIMARY KEY,
    value      JSONB       NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. expenses ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.expenses (
    id          TEXT            PRIMARY KEY,
    paid_by     TEXT            NOT NULL,
    amount      DECIMAL(10, 2)  NOT NULL,
    category    TEXT            NOT NULL,
    description TEXT            DEFAULT '',
    date        DATE            NOT NULL,
    active      BOOLEAN         DEFAULT TRUE,
    created_at  BIGINT          NOT NULL   -- Unix ms timestamp
);

-- ── 3. settlements ───────────────────────────────────────────────────────────
-- "from" and "to" are reserved SQL keywords, so we use from_person / to_person
CREATE TABLE IF NOT EXISTS public.settlements (
    id          TEXT            PRIMARY KEY,
    from_person TEXT            NOT NULL,
    to_person   TEXT            NOT NULL,
    amount      DECIMAL(10, 2)  NOT NULL,
    active      BOOLEAN         DEFAULT TRUE,
    created_at  BIGINT          NOT NULL
);

-- ── 4. rent_data ─────────────────────────────────────────────────────────────
-- One row per month (YYYY-MM). paid is a JSON map of { name: boolean }.
CREATE TABLE IF NOT EXISTS public.rent_data (
    month  TEXT            PRIMARY KEY,  -- e.g. "2025-05"
    amount DECIMAL(10, 2)  DEFAULT 0,
    paid   JSONB           DEFAULT '{}'::jsonb
);

-- ═══════════════════════════════════════════════════════════════════════════
--  Disable Row-Level Security (private shared app — no per-user auth)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.settings    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_data   DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
--  Enable Realtime (required for live sync across devices)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settlements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rent_data;
