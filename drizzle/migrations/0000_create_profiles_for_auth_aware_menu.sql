CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  interests jsonb NOT NULL DEFAULT '[]'::jsonb,
  captions_enabled boolean NOT NULL DEFAULT true,
  soundtrack_preference text NOT NULL DEFAULT 'quiet',
  narration_preference text NOT NULL DEFAULT 'off',
  reduced_motion boolean NOT NULL DEFAULT false,
  contributor_status text NOT NULL DEFAULT 'visitor',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_contributor_status_check CHECK (contributor_status IN ('visitor', 'applicant', 'contributor')),
  CONSTRAINT profiles_interests_array_check CHECK (jsonb_typeof(interests) = 'array')
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();