-- KVKK alanlarını users tablosuna ekliyoruz
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kvkk_accepted" BOOLEAN DEFAULT FALSE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kvkk_accepted_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kvkk_ip_address" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kvkk_version" TEXT DEFAULT 'v1.0';
