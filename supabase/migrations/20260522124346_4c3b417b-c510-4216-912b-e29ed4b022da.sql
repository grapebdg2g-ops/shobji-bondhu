CREATE TABLE public.prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'কেজি',
  market_name TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT,
  category TEXT NOT NULL DEFAULT 'অন্যান্য',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL DEFAULT '',
  previous_price NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view prices"
  ON public.prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own prices"
  ON public.prices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prices"
  ON public.prices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prices"
  ON public.prices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_prices_district_created ON public.prices(district, created_at DESC);
CREATE INDEX idx_prices_category ON public.prices(category);

ALTER PUBLICATION supabase_realtime ADD TABLE public.prices;
ALTER TABLE public.prices REPLICA IDENTITY FULL;