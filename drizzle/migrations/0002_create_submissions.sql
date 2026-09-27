CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  place text CHECK (char_length(place) <= 160),
  date_label text CHECK (char_length(date_label) <= 80),
  story text CHECK (char_length(story) <= 5000),
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'under_review' CHECK (status IN ('draft','under_review','published')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own submissions select" ON public.submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own submissions insert" ON public.submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status IN ('draft','under_review'));
CREATE POLICY "Own submissions delete" ON public.submissions FOR DELETE TO authenticated USING (auth.uid() = user_id AND status <> 'published');
CREATE INDEX submissions_user_idx ON public.submissions(user_id, created_at DESC);