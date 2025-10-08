-- ============================================
-- SCHEMA DO BANCO DE DADOS - LINK IN BIO PLATFORM
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. CREATE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  title TEXT,
  avatar_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS profiles_slug_idx ON profiles(slug);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
  ON profiles FOR DELETE 
  USING (auth.uid() = id);


-- 2. CREATE SOCIAL_LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  display_name TEXT NOT NULL,
  url TEXT NOT NULL,
  color TEXT DEFAULT '#0891B2',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS social_links_user_id_idx ON social_links(user_id);

-- Enable RLS
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_links
CREATE POLICY "Social links are viewable by everyone" 
  ON social_links FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own social links" 
  ON social_links FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social links" 
  ON social_links FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social links" 
  ON social_links FOR DELETE 
  USING (auth.uid() = user_id);


-- 3. CREATE CUSTOM_BUTTONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_buttons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  url TEXT NOT NULL,
  icon TEXT,
  link_type TEXT DEFAULT 'external',
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS custom_buttons_user_id_idx ON custom_buttons(user_id);

-- Enable RLS
ALTER TABLE custom_buttons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_buttons
CREATE POLICY "Custom buttons are viewable by everyone" 
  ON custom_buttons FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own custom buttons" 
  ON custom_buttons FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom buttons" 
  ON custom_buttons FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom buttons" 
  ON custom_buttons FOR DELETE 
  USING (auth.uid() = user_id);


-- 4. CREATE LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads(user_id);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
CREATE POLICY "Anyone can insert leads" 
  ON leads FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view their own leads" 
  ON leads FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" 
  ON leads FOR DELETE 
  USING (auth.uid() = user_id);


-- 5. CREATE STORAGE BUCKET FOR AVATARS
-- ============================================
-- Execute este comando separadamente no Supabase Dashboard > Storage
-- ou use a interface para criar um bucket chamado "avatars"
-- com as seguintes configurações:
-- - Public: true
-- - File size limit: 2MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- 6. CREATE FUNCTION TO AUTO-UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- 7. CREATE FUNCTION TO AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, slug)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'slug', NEW.id::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- FIM DO SCHEMA
-- ============================================
-- Após executar este script, verifique se todas as tabelas
-- foram criadas corretamente no Supabase Dashboard

