-- USERS & PROFILES
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin','agent','marketing','vendor')) not null default 'agent',
  full_name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "profiles self read" on profiles for select using (auth.uid() = user_id);

create policy "admin all profiles" on profiles
  for all using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.role='admin'));

-- LISTINGS
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  address_line text not null,
  suburb text not null,
  state text not null default 'VIC',
  postcode text not null,
  lat double precision,
  lng double precision,
  beds int,
  baths int,
  cars int,
  land_size_sqm int,
  property_type text,
  price_guide_text text,
  soi_url text,
  status text check (status in ('draft','active','sold')) default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table listings enable row level security;

create policy "agents own listings" on listings
  for all using (
    created_by = auth.uid()
    or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing'))
);

-- MEDIA
create table if not exists listing_media (
  id bigserial primary key,
  listing_id uuid references listings(id) on delete cascade,
  url text not null,
  kind text check (kind in ('hero','gallery','floorplan','doc')) default 'gallery',
  created_at timestamptz default now()
);

alter table listing_media enable row level security;

create policy "media visible with listing" on listing_media
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid() or l.status = 'active'
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

create policy "media manage own listings" on listing_media
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

-- ENRICHMENT (1:1 with listing)
create table if not exists enrichment (
  listing_id uuid primary key references listings(id) on delete cascade,
  schools_json jsonb,
  planning_overlays_json jsonb,
  heritage_json jsonb,
  ptv_json jsonb,
  pois_json jsonb,
  suburb_medians_json jsonb,
  disclaimers_json jsonb,
  generated_at timestamptz
);

alter table enrichment enable row level security;

create policy "enrichment visible with listing" on enrichment
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid() or l.status = 'active'
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

create policy "enrichment manage own listings" on enrichment
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

-- GENERATED SOCIAL ASSETS
create table if not exists social_assets (
  id bigserial primary key,
  listing_id uuid references listings(id) on delete cascade,
  type text check (type in ('reels_short','reels_long','reels_deep','carousel','post')) not null,
  payload_json jsonb not null,
  status text check (status in ('draft','ready','published')) default 'draft',
  created_at timestamptz default now()
);

alter table social_assets enable row level security;

create policy "assets visible with listing" on social_assets
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid() or l.status = 'active'
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

create policy "assets manage own listings" on social_assets
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

-- PROPERTY PACK
create table if not exists property_packs (
  id bigserial primary key,
  listing_id uuid references listings(id) on delete cascade,
  pdf_url text,
  version int default 1,
  generated_at timestamptz default now()
);

alter table property_packs enable row level security;

create policy "packs visible with listing" on property_packs
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid() or l.status = 'active'
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

create policy "packs manage own listings" on property_packs
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

-- LEADS & RSVPS
create table if not exists leads (
  id bigserial primary key,
  listing_id uuid references listings(id) on delete cascade,
  name text,
  email text,
  phone text,
  source text,
  utm_json jsonb,
  created_at timestamptz default now()
);

alter table leads enable row level security;

create policy "leads visible to listing owners" on leads
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

create policy "leads insert public" on leads
  for insert with check (true);

create table if not exists rsvps (
  id bigserial primary key,
  listing_id uuid references listings(id) on delete cascade,
  full_name text,
  contact text,
  session_time timestamptz,
  notes text,
  created_at timestamptz default now()
);

alter table rsvps enable row level security;

create policy "rsvps visible to listing owners" on rsvps
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

create policy "rsvps insert public" on rsvps
  for insert with check (true);

-- AI AUDIT LOG
create table if not exists ai_audit (
  id bigserial primary key,
  listing_id uuid references listings(id) on delete cascade,
  checks_json jsonb,
  passed boolean,
  notes text,
  created_at timestamptz default now()
);

alter table ai_audit enable row level security;

create policy "audit visible to listing owners" on ai_audit
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing')))
    )
  );

-- SUBURBS cache (for expertise pages)
create table if not exists suburbs (
  name text primary key,
  lga text,
  stats_json jsonb,
  updated_at timestamptz default now()
);

alter table suburbs enable row level security;

create policy "suburbs public read" on suburbs for select using (true);
create policy "suburbs admin write" on suburbs for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- FETCH CACHE (for rate/cost control)
create table if not exists fetch_cache (
  cache_key text primary key,
  payload_json jsonb,
  etag text,
  expires_at timestamptz
);

alter table fetch_cache enable row level security;

create policy "cache public read" on fetch_cache for select using (true);
create policy "cache system write" on fetch_cache for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','marketing'))
);

-- OPTIONAL DATASETS
create table if not exists schools (
  id bigserial primary key,
  name text not null,
  sector text,
  level text,
  address text,
  suburb text,
  postcode text,
  lat double precision,
  lng double precision
);

alter table schools enable row level security;

create policy "schools public read" on schools for select using (true);
create policy "schools admin write" on schools for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

create table if not exists vgv_medians (
  id bigserial primary key,
  suburb text not null,
  property_type text check (property_type in ('house','unit')) not null,
  year int not null,
  median_price numeric,
  sales_count int
);

alter table vgv_medians enable row level security;

create policy "medians public read" on vgv_medians for select using (true);
create policy "medians admin write" on vgv_medians for all using (
  exists (select 1 from profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- Indexes for performance
create index if not exists idx_listings_suburb_status on listings (suburb, status);
create index if not exists idx_listings_created_by on listings (created_by);
create index if not exists idx_schools_suburb on schools (suburb);
create index if not exists idx_vgv_medians_suburb_type_year on vgv_medians (suburb, property_type, year);
create index if not exists idx_leads_listing on leads (listing_id);
create index if not exists idx_rsvps_listing on rsvps (listing_id);

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'agent'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();