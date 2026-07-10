-- ============================================================
-- Dorcy Vogue — required database migration
-- Run this ONCE in Supabase → SQL Editor → New query → Run.
-- Safe to run more than once (uses IF NOT EXISTS).
-- ============================================================

-- 1. Product video support (the app saves a video URL per product,
--    but the column was missing — this is why videos never persisted).
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS video_url text;

-- 2. (Optional but recommended) speed up sorting the admin product list.
CREATE INDEX IF NOT EXISTS products_created_at_idx
  ON public.products (created_at DESC);

-- 3. (Optional) speed up the active-products lookups used by the storefront.
CREATE INDEX IF NOT EXISTS products_status_idx
  ON public.products (status);
