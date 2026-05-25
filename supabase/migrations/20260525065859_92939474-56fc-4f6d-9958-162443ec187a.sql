CREATE TABLE public.exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'seed',
  is_free BOOLEAN NOT NULL DEFAULT false,
  price NUMERIC,
  unit TEXT,
  image_url TEXT,
  district TEXT NOT NULL,
  upazila TEXT,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  user_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active exchanges"
  ON public.exchanges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Auth users insert own exchanges"
  ON public.exchanges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own exchanges"
  ON public.exchanges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own exchanges"
  ON public.exchanges FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_exchanges_district_created ON public.exchanges (district, created_at DESC);
CREATE INDEX idx_exchanges_type ON public.exchanges (type);

ALTER PUBLICATION supabase_realtime ADD TABLE public.exchanges;