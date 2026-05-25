DROP POLICY IF EXISTS "Anyone authenticated can view prices" ON public.prices;
CREATE POLICY "Anyone can read prices" ON public.prices FOR SELECT USING (true);