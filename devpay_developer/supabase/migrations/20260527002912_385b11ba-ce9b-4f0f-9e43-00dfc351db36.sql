
-- =========================
-- Enums
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.availability_status AS ENUM ('available', 'busy', 'not_available');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'pro');
CREATE TYPE public.job_status AS ENUM ('open', 'in_review', 'awarded', 'closed');
CREATE TYPE public.experience_level AS ENUM ('entry', 'intermediate', 'expert');
CREATE TYPE public.proposal_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE public.contract_status AS ENUM ('active', 'completed', 'disputed', 'paused');
CREATE TYPE public.activity_type AS ENUM ('proposal', 'payment', 'contract', 'message', 'review');
CREATE TYPE public.txn_type AS ENUM ('deposit', 'escrow_hold', 'escrow_release', 'payout', 'fee', 'refund');
CREATE TYPE public.txn_status AS ENUM ('pending', 'completed', 'failed');

-- =========================
-- profiles
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  city TEXT,
  country TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  subscription_plan public.subscription_plan NOT NULL DEFAULT 'free',
  availability public.availability_status NOT NULL DEFAULT 'available',
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  jobs_completed INTEGER NOT NULL DEFAULT 0,
  response_rate INTEGER NOT NULL DEFAULT 100,
  ai_skill_score INTEGER NOT NULL DEFAULT 0,
  proposals_used INTEGER NOT NULL DEFAULT 0,
  proposals_limit INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- =========================
-- user_roles
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========================
-- skills
-- =========================
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT
);
GRANT SELECT ON public.skills TO anon, authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills are public" ON public.skills FOR SELECT USING (true);

CREATE TABLE public.user_skills (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency INTEGER NOT NULL DEFAULT 3 CHECK (proficiency BETWEEN 1 AND 5),
  PRIMARY KEY (user_id, skill_id)
);
GRANT SELECT ON public.user_skills TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_skills TO authenticated;
GRANT ALL ON public.user_skills TO service_role;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User skills are public read" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users manage own skills" ON public.user_skills FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================
-- jobs
-- =========================
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_verified BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'web',
  experience_level public.experience_level NOT NULL DEFAULT 'intermediate',
  duration_label TEXT NOT NULL DEFAULT '2 weeks',
  budget_min_usd INTEGER NOT NULL DEFAULT 0,
  budget_max_usd INTEGER NOT NULL DEFAULT 0,
  proposals_count INTEGER NOT NULL DEFAULT 0,
  status public.job_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX jobs_status_created_idx ON public.jobs(status, created_at DESC);
CREATE INDEX jobs_search_idx ON public.jobs USING gin (to_tsvector('english', title || ' ' || description));
GRANT SELECT ON public.jobs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are publicly readable" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Clients create their own jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients update their own jobs" ON public.jobs FOR UPDATE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Clients delete their own jobs" ON public.jobs FOR DELETE TO authenticated USING (auth.uid() = client_id);

CREATE TABLE public.job_skills (
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, skill_id)
);
GRANT SELECT ON public.job_skills TO anon, authenticated;
GRANT INSERT, DELETE ON public.job_skills TO authenticated;
GRANT ALL ON public.job_skills TO service_role;
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job skills public read" ON public.job_skills FOR SELECT USING (true);
CREATE POLICY "Job owner manages skills" ON public.job_skills FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND client_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND client_id = auth.uid()));

CREATE TABLE public.saved_jobs (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved jobs" ON public.saved_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================
-- proposals
-- =========================
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter TEXT NOT NULL DEFAULT '',
  bid_usd INTEGER NOT NULL,
  days INTEGER NOT NULL,
  status public.proposal_status NOT NULL DEFAULT 'pending',
  viewed_by_client BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX proposals_dev_idx ON public.proposals(developer_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Developer reads own proposals" ON public.proposals FOR SELECT TO authenticated
  USING (auth.uid() = developer_id OR auth.uid() IN (SELECT client_id FROM public.jobs WHERE id = job_id));
CREATE POLICY "Developer creates own proposals" ON public.proposals FOR INSERT TO authenticated WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Developer updates own proposals" ON public.proposals FOR UPDATE TO authenticated USING (auth.uid() = developer_id);
CREATE POLICY "Developer deletes own proposals" ON public.proposals FOR DELETE TO authenticated USING (auth.uid() = developer_id);

-- =========================
-- contracts
-- =========================
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  developer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_verified BOOLEAN NOT NULL DEFAULT false,
  title TEXT NOT NULL,
  milestone_total INTEGER NOT NULL DEFAULT 1,
  milestone_current INTEGER NOT NULL DEFAULT 1,
  current_milestone_label TEXT NOT NULL DEFAULT '',
  agreed_usd INTEGER NOT NULL DEFAULT 0,
  escrow_usd INTEGER NOT NULL DEFAULT 0,
  status public.contract_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX contracts_dev_idx ON public.contracts(developer_id, status, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties read own contracts" ON public.contracts FOR SELECT TO authenticated USING (auth.uid() = developer_id OR auth.uid() = client_id);
CREATE POLICY "Parties update own contracts" ON public.contracts FOR UPDATE TO authenticated USING (auth.uid() = developer_id OR auth.uid() = client_id);
CREATE POLICY "Client creates contract" ON public.contracts FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);

-- =========================
-- activities
-- =========================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.activity_type NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX activities_user_idx ON public.activities(user_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own activities" ON public.activities FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activities" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================
-- conversations + messages
-- =========================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  contract_active BOOLEAN NOT NULL DEFAULT false,
  last_message TEXT NOT NULL DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unread_for_developer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX conversations_dev_idx ON public.conversations(developer_id, last_message_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties read own conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = developer_id OR auth.uid() = client_id);
CREATE POLICY "Parties update own conversations" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() = developer_id OR auth.uid() = client_id);
CREATE POLICY "Authed insert conversation" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = developer_id OR auth.uid() = client_id);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX messages_conv_idx ON public.messages(conversation_id, created_at);
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversation parties read messages" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (auth.uid() = c.developer_id OR auth.uid() = c.client_id)));
CREATE POLICY "Sender writes messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- =========================
-- wallet_transactions
-- =========================
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  type public.txn_type NOT NULL,
  status public.txn_status NOT NULL DEFAULT 'completed',
  amount_usd NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wallet_user_idx ON public.wallet_transactions(user_id, created_at DESC);
GRANT SELECT, INSERT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own wallet" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own wallet" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =========================
-- handle_new_user trigger: auto-create profile
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix INTEGER := 0;
BEGIN
  base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(COALESCE(NEW.email, 'user'), '@', 1), '[^a-z0-9]', '', 'g'));
  IF base_username = '' THEN base_username := 'user'; END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    suffix := suffix + 1;
    final_username := base_username || suffix::TEXT;
  END LOOP;

  INSERT INTO public.profiles (id, username, full_name, headline, avatar_url, city, country)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', INITCAP(base_username)),
    'Developer on DevPay Africa',
    NEW.raw_user_meta_data->>'avatar_url',
    'Accra',
    'Ghana'
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- updated_at triggers
-- =========================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER jobs_touch BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER proposals_touch BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER contracts_touch BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================
-- Seed skills
-- =========================
INSERT INTO public.skills (name, category) VALUES
  ('React','frontend'),('TypeScript','language'),('Next.js','frontend'),('Tailwind','frontend'),
  ('React Native','mobile'),('Expo','mobile'),('Node.js','backend'),('Supabase','backend'),
  ('PostgreSQL','database'),('Paystack','fintech'),('Stripe','fintech'),('MoMo','fintech'),
  ('Storybook','frontend'),('GraphQL','backend'),('Python','language'),('Django','backend');
