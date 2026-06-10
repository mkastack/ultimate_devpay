
CREATE TABLE public.contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hire_request_id uuid NOT NULL REFERENCES public.hire_requests(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  job_title text NOT NULL,
  developer_name text NOT NULL,
  amount numeric NOT NULL,
  platform_fee numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  deadline date,
  milestones jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.contracts TO authenticated, anon;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view contracts (demo)" ON public.contracts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert contracts (demo)" ON public.contracts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update contracts (demo)" ON public.contracts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.escrow_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | funded | locked | released | refunded
  funded_at timestamptz,
  locked_at timestamptz,
  released_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.escrow_accounts TO authenticated, anon;
GRANT ALL ON public.escrow_accounts TO service_role;
ALTER TABLE public.escrow_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view escrow (demo)" ON public.escrow_accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert escrow (demo)" ON public.escrow_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update escrow (demo)" ON public.escrow_accounts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER contracts_touch BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER escrow_touch BEFORE UPDATE ON public.escrow_accounts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
