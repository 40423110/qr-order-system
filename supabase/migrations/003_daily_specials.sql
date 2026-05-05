CREATE TABLE IF NOT EXISTS daily_specials (
  item_id TEXT PRIMARY KEY,
  note    TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE daily_specials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_specials"  ON daily_specials FOR SELECT USING (true);
CREATE POLICY "service_all_specials"  ON daily_specials FOR ALL  USING (true);
