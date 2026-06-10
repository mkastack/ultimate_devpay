
CREATE TABLE public.hire_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  developer_name TEXT NOT NULL,
  bid_amount NUMERIC NOT NULL,
  days INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.hire_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hire_requests TO authenticated;
GRANT ALL ON public.hire_requests TO service_role;

ALTER TABLE public.hire_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a hire request"
ON public.hire_requests FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view hire requests (demo)"
ON public.hire_requests FOR SELECT TO anon, authenticated
USING (true);
