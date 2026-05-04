-- 享之饌東石鮮蚵 QR 點餐系統 DB Schema
-- 請在 Supabase SQL Editor 中執行此檔案

-- 桌位表（預設 1~20 號桌）
CREATE TABLE IF NOT EXISTS tables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number  INTEGER NOT NULL UNIQUE,
  label         TEXT NOT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

INSERT INTO tables (table_number, label) VALUES
  (1,'1號桌'),(2,'2號桌'),(3,'3號桌'),(4,'4號桌'),(5,'5號桌'),
  (6,'6號桌'),(7,'7號桌'),(8,'8號桌'),(9,'9號桌'),(10,'10號桌'),
  (11,'11號桌'),(12,'12號桌'),(13,'13號桌'),(14,'14號桌'),(15,'15號桌'),
  (16,'16號桌'),(17,'17號桌'),(18,'18號桌'),(19,'19號桌'),(20,'20號桌')
ON CONFLICT (table_number) DO NOTHING;

-- 訂單表
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id      UUID REFERENCES tables(id),
  table_number  INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','completed','paid')),
  total_amount  INTEGER NOT NULL DEFAULT 0,
  customer_note TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  paid_at       TIMESTAMPTZ
);

-- 訂單明細表
CREATE TABLE IF NOT EXISTS order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_id         TEXT NOT NULL,
  item_name       TEXT NOT NULL,
  item_price      INTEGER NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  subtotal        INTEGER NOT NULL,
  special_request TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_orders_table_id   ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);

-- RLS (Row Level Security)
ALTER TABLE tables      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- tables：所有人可讀
CREATE POLICY "public_read_tables" ON tables FOR SELECT USING (true);

-- orders：所有人可新增、可讀；只有 service_role 可以修改（透過 API）
CREATE POLICY "public_insert_orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_select_orders" ON orders FOR SELECT USING (true);
CREATE POLICY "service_update_orders" ON orders FOR UPDATE USING (true);

-- order_items：所有人可新增、可讀
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "public_select_order_items" ON order_items FOR SELECT USING (true);

-- Realtime 訂閱（在 Supabase Dashboard > Database > Replication 開啟 orders 表即可）
-- 或執行：ALTER PUBLICATION supabase_realtime ADD TABLE orders;
