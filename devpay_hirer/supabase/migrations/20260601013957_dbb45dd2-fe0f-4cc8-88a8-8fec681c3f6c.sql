
-- Registry tables
CREATE TABLE IF NOT EXISTS public.jobs_registry (
  id text PRIMARY KEY,
  title text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  budget_min numeric NOT NULL DEFAULT 0 CHECK (budget_min >= 0),
  budget_max numeric NOT NULL DEFAULT 0 CHECK (budget_max >= budget_min),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs_registry TO anon, authenticated;
GRANT ALL ON public.jobs_registry TO service_role;
ALTER TABLE public.jobs_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read jobs_registry" ON public.jobs_registry FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.developers_registry (
  name text PRIMARY KEY,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.developers_registry TO anon, authenticated;
GRANT ALL ON public.developers_registry TO service_role;
ALTER TABLE public.developers_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read developers_registry" ON public.developers_registry FOR SELECT USING (true);

-- Extend hire_requests
ALTER TABLE public.hire_requests
  ADD COLUMN IF NOT EXISTS milestones jsonb,
  ADD COLUMN IF NOT EXISTS deadline date,
  ADD COLUMN IF NOT EXISTS budget_min numeric,
  ADD COLUMN IF NOT EXISTS budget_max numeric,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Constraints
ALTER TABLE public.hire_requests
  DROP CONSTRAINT IF EXISTS hire_requests_bid_positive,
  DROP CONSTRAINT IF EXISTS hire_requests_days_range,
  DROP CONSTRAINT IF EXISTS hire_requests_status_enum,
  DROP CONSTRAINT IF EXISTS hire_requests_budget_range,
  DROP CONSTRAINT IF EXISTS hire_requests_milestones_array;

ALTER TABLE public.hire_requests
  ADD CONSTRAINT hire_requests_bid_positive CHECK (bid_amount > 0),
  ADD CONSTRAINT hire_requests_days_range CHECK (days IS NULL OR (days BETWEEN 1 AND 365)),
  ADD CONSTRAINT hire_requests_status_enum CHECK (status IN ('pending','approved','rejected','funded','cancelled')),
  ADD CONSTRAINT hire_requests_budget_range CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min),
  ADD CONSTRAINT hire_requests_milestones_array CHECK (milestones IS NULL OR jsonb_typeof(milestones) = 'array');

-- Validation trigger: approved job + verified dev + budget within range + bid covered by milestones
CREATE OR REPLACE FUNCTION public.validate_hire_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.jobs_registry%ROWTYPE;
  v_dev public.developers_registry%ROWTYPE;
  v_sum numeric;
BEGIN
  SELECT * INTO v_job FROM public.jobs_registry WHERE id = NEW.job_id;
  IF NOT FOUND OR NOT v_job.approved THEN
    RAISE EXCEPTION 'Job % is not approved', NEW.job_id USING ERRCODE = 'check_violation';
  END IF;

  SELECT * INTO v_dev FROM public.developers_registry WHERE name = NEW.developer_name;
  IF NOT FOUND OR NOT v_dev.verified THEN
    RAISE EXCEPTION 'Developer % is not verified', NEW.developer_name USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.bid_amount < v_job.budget_min OR NEW.bid_amount > v_job.budget_max THEN
    RAISE EXCEPTION 'Bid % outside approved budget range [%, %]', NEW.bid_amount, v_job.budget_min, v_job.budget_max USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.milestones IS NOT NULL THEN
    IF jsonb_array_length(NEW.milestones) < 1 OR jsonb_array_length(NEW.milestones) > 20 THEN
      RAISE EXCEPTION 'Milestones must contain between 1 and 20 entries' USING ERRCODE = 'check_violation';
    END IF;
    SELECT COALESCE(SUM((m->>'amount')::numeric), 0) INTO v_sum
      FROM jsonb_array_elements(NEW.milestones) m;
    IF ABS(v_sum - NEW.bid_amount) > 0.01 THEN
      RAISE EXCEPTION 'Milestone amounts (%) must sum to bid amount (%)', v_sum, NEW.bid_amount USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_hire_request ON public.hire_requests;
CREATE TRIGGER trg_validate_hire_request
  BEFORE INSERT OR UPDATE ON public.hire_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_hire_request();

-- Seed demo registries from existing mock data so the flow works end-to-end
INSERT INTO public.jobs_registry (id, title, approved, budget_min, budget_max) VALUES
  ('j1', 'E-commerce Mobile App', true, 5000, 25000),
  ('j2', 'Analytics Dashboard', true, 3000, 18000),
  ('j3', 'Brand Website Redesign', true, 2000, 12000)
ON CONFLICT (id) DO UPDATE SET approved = EXCLUDED.approved,
  budget_min = EXCLUDED.budget_min, budget_max = EXCLUDED.budget_max, title = EXCLUDED.title;

INSERT INTO public.developers_registry (name, verified) VALUES
  ('Kwame Asante', true),
  ('Adaeze Okafor', true),
  ('Thabo Molefe', true),
  ('Amara Diallo', true),
  ('Sipho Ndlovu', true),
  ('Fatou Sow', true)
ON CONFLICT (name) DO UPDATE SET verified = EXCLUDED.verified;
