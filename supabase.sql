-- Salon Lepote Still: Supabase setup
-- 1) Create a Supabase project.
-- 2) Run this SQL in SQL Editor.
-- 3) Create one admin user in Authentication > Users.
-- 4) Put the project URL + anon public key into /config.js.

create table if not exists public.services (
  id text primary key,
  category text not null,
  name text not null,
  price_min integer not null check (price_min >= 0),
  price_max integer not null check (price_max >= price_min),
  currency text not null default 'RSD',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

-- Required grants for the browser clients. RLS still controls which rows are accessible.
grant usage on schema public to anon, authenticated;
grant select on table public.services to anon, authenticated;
grant insert, update, delete on table public.services to authenticated;

-- Public visitors can read active services only.
drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services"
on public.services for select
to anon
using (active = true);

drop policy if exists "Authenticated users can read services" on public.services;
create policy "Authenticated users can read services"
on public.services for select
to authenticated
using (true);

-- Authenticated admin users can manage the price list.
-- If you want to restrict this further, replace authenticated with a specific admin-email policy.
drop policy if exists "Authenticated admins can insert" on public.services;
create policy "Authenticated admins can insert"
on public.services for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can update" on public.services;
create policy "Authenticated admins can update"
on public.services for update
to authenticated
using (true) with check (true);

drop policy if exists "Authenticated admins can delete" on public.services;
create policy "Authenticated admins can delete"
on public.services for delete
to authenticated
using (true);

-- Optional updated_at trigger.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

-- Seed data: run after creating the table.
insert into public.services (id, category, name, price_min, price_max, currency, active, sort_order) values
('fr-01','Frizerske usluge','Šišanje',700,1000,'RSD',true,1),
('fr-02','Frizerske usluge','Feniranje',700,1000,'RSD',true,2),
('fr-03','Frizerske usluge','Navijanje',700,1000,'RSD',true,3),
('fr-04','Frizerske usluge','Svečane frizure',1000,1500,'RSD',true,4),
('fr-05','Frizerske usluge','Frizure sa nadogradnjom na klipse (iznajmljivanje)',2500,3000,'RSD',true,5),
('fr-06','Frizerske usluge','Farbanje',1300,2500,'RSD',true,6),
('fr-07','Frizerske usluge','Nijansiranje',6000,12000,'RSD',true,7),
('fr-08','Frizerske usluge','Izvlačenje pramenova',6000,12000,'RSD',true,8),
('fr-09','Frizerske usluge','Balayage',6000,12000,'RSD',true,9),
('fr-10','Frizerske usluge','Prelivi',1000,2000,'RSD',true,10),
('fr-11','Frizerske usluge','Keratinsko ispravljanje',8000,20000,'RSD',true,11),
('fr-12','Frizerske usluge','Minival',6000,10000,'RSD',true,12),
('ko-01','Kozmetičke usluge','Nadogradnja noktiju',2000,2000,'RSD',true,1),
('ko-02','Kozmetičke usluge','Korekcija noktiju',1800,1800,'RSD',true,2),
('ko-03','Kozmetičke usluge','Izlivanje noktiju',2500,2500,'RSD',true,3),
('ko-04','Kozmetičke usluge','Gel na noktima',1500,1500,'RSD',true,4),
('ko-05','Kozmetičke usluge','Gel na noge',1500,1500,'RSD',true,5),
('ko-06','Kozmetičke usluge','Šminkanje',3500,3500,'RSD',true,6),
('ko-07','Kozmetičke usluge','Oblikovanje i farbanje obrva',1000,1000,'RSD',true,7)
on conflict (id) do update set
category=excluded.category,name=excluded.name,price_min=excluded.price_min,price_max=excluded.price_max,currency=excluded.currency,active=excluded.active,sort_order=excluded.sort_order;
