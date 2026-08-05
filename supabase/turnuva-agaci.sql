-- ============================================================
-- GeoGuessrTürkiye — Turnuva ağacı (32 kişilik, 4 torbalı kura)
-- + Davetli turnuva desteği (katilim kolonu)
-- Supabase Dashboard > SQL Editor'e yapıştırıp çalıştırın.
-- (kurulum.sql'deki turnuvalar tablosu kurulu olmalıdır.)
-- ============================================================

-- ---------- Davetli turnuvalar ----------
-- basvuru: site üzerinden başvuru alınır (mevcut davranış)
-- davetli: turnuva sitede görünür ama başvuru alınmaz
alter table public.turnuvalar
  add column if not exists katilim text not null default 'basvuru'
  check (katilim in ('basvuru', 'davetli'));

-- Kontenjan kontrolü: davetli turnuvalara başvuru DB seviyesinde de kapalı
create or replace function public.kontenjan_var(tid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select t.durum = 'acik'
     and t.katilim = 'basvuru'
     and (select count(*) from basvurular b where b.turnuva_id = tid)
         < least(coalesce(t.max_katilimci, 10000), 10000)
  from turnuvalar t
  where t.id = tid
$$;

-- Her turnuvanın en fazla bir ağacı olur (turnuva_id primary key).
--   torbalar : 4 torba × 8 oyuncu adı            → [[..8 ad..], [..], [..], [..]]
--   bolgeler : kura sonucu 8 bölge × 4 oyuncu    → [[torba1, torba2, torba3, torba4], ...]
--   sonuclar : maç kimliği → kazanan oyuncu adı  → {"r1-0": "oyuncu", ...}
--   yayinda  : true olduğunda ağaç sitede herkese görünür
create table if not exists public.turnuva_agaclari (
  turnuva_id  uuid primary key references public.turnuvalar (id) on delete cascade,
  torbalar    jsonb not null default '[[],[],[],[]]',
  bolgeler    jsonb not null default '[]',
  sonuclar    jsonb not null default '{}',
  yayinda     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- Satır bazlı güvenlik (RLS) ----------

alter table public.turnuva_agaclari enable row level security;

-- Herkes SADECE yayına alınmış ağaçları görür
drop policy if exists "herkes yayindaki agaclari gorur" on public.turnuva_agaclari;
create policy "herkes yayindaki agaclari gorur"
  on public.turnuva_agaclari for select
  to anon
  using (yayinda);

-- Giriş yapmış adminler her şeyi yapabilir
drop policy if exists "adminler agaclari yonetir" on public.turnuva_agaclari;
create policy "adminler agaclari yonetir"
  on public.turnuva_agaclari for all
  to authenticated
  using (true)
  with check (true);
