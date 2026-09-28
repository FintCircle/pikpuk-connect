ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text = 'admin')
$$;

GRANT SELECT ON public.submissions TO anon;
GRANT UPDATE (status) ON public.submissions TO authenticated;

CREATE POLICY "Published submissions are public" ON public.submissions FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read all submissions" ON public.submissions FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins review submissions" ON public.submissions FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));