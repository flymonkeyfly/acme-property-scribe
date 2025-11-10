-- Create security definer function to check user roles without RLS recursion
create or replace function public.has_role(_user_id uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create security definer function to check if user has any of multiple roles
create or replace function public.has_any_role(_user_id uuid, _roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = _user_id
      and role = any(_roles)
  )
$$;

-- Drop and recreate policies to use the security definer functions

-- Profiles policies
drop policy if exists "admin all profiles" on profiles;
create policy "admin all profiles" on profiles
  for all using (public.has_role(auth.uid(), 'admin'));

-- Listings policies
drop policy if exists "agents own listings" on listings;
create policy "agents own listings" on listings
  for all using (
    created_by = auth.uid()
    or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing'])
  );

-- Media policies
drop policy if exists "media visible with listing" on listing_media;
create policy "media visible with listing" on listing_media
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid() or l.status = 'active'
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

drop policy if exists "media manage own listings" on listing_media;
create policy "media manage own listings" on listing_media
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

-- Enrichment policies
drop policy if exists "enrichment visible with listing" on enrichment;
create policy "enrichment visible with listing" on enrichment
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid() or l.status = 'active'
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

drop policy if exists "enrichment manage own listings" on enrichment;
create policy "enrichment manage own listings" on enrichment
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

-- Social assets policies
drop policy if exists "assets visible with listing" on social_assets;
create policy "assets visible with listing" on social_assets
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid() or l.status = 'active'
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

drop policy if exists "assets manage own listings" on social_assets;
create policy "assets manage own listings" on social_assets
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

-- Property packs policies
drop policy if exists "packs visible with listing" on property_packs;
create policy "packs visible with listing" on property_packs
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid() or l.status = 'active'
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

drop policy if exists "packs manage own listings" on property_packs;
create policy "packs manage own listings" on property_packs
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

-- Leads policies
drop policy if exists "leads visible to listing owners" on leads;
create policy "leads visible to listing owners" on leads
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

-- RSVPs policies
drop policy if exists "rsvps visible to listing owners" on rsvps;
create policy "rsvps visible to listing owners" on rsvps
  for select using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

-- AI audit policies
drop policy if exists "audit visible to listing owners" on ai_audit;
create policy "audit visible to listing owners" on ai_audit
  for all using (
    exists (
      select 1 from listings l 
      where l.id = listing_id 
      and (l.created_by = auth.uid()
           or public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']))
    )
  );

-- Cache policies
drop policy if exists "cache system write" on fetch_cache;
create policy "cache system write" on fetch_cache
  for all using (public.has_any_role(auth.uid(), ARRAY['admin', 'marketing']));

-- Schools policies
drop policy if exists "schools admin write" on schools;
create policy "schools admin write" on schools
  for all using (public.has_role(auth.uid(), 'admin'));

-- Suburbs policies
drop policy if exists "suburbs admin write" on suburbs;
create policy "suburbs admin write" on suburbs
  for all using (public.has_role(auth.uid(), 'admin'));

-- VGV medians policies
drop policy if exists "medians admin write" on vgv_medians;
create policy "medians admin write" on vgv_medians
  for all using (public.has_role(auth.uid(), 'admin'));