-- Migration 002: 讓 orders.table_id 可為 null 並移除外鍵約束
-- 目的：讓客人從非 QR Code URL 進入時仍可正常送出訂單，不因 FK 違反而失敗
--
-- 使用方法：在 Supabase Dashboard > SQL Editor 中貼上並執行此檔案
-- （或使用 Supabase CLI: supabase db push）

-- 1. 移除外鍵約束（若存在）
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_table_id_fkey;

-- 2. 讓 table_id 欄位允許 NULL（原本已是 NULLABLE，此行確保相容性）
ALTER TABLE orders ALTER COLUMN table_id DROP NOT NULL;
