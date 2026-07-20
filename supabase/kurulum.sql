-- ============================================================
-- GeoGuessrTürkiye — Turnuva başvuru sistemi veritabanı kurulumu
-- Supabase Dashboard > SQL Editor'e yapıştırıp çalıştırın.
-- ============================================================

-- ---------- Tablolar ----------

create table if not exists public.turnuvalar (
  id             uuid primary key default gen_random_uuid(),
  ad             text not null check (char_length(ad) between 3 and 120),
  aciklama       text not null default '' check (char_length(aciklama) <= 2000),
  format         text not null default '' check (char_length(format) <= 80),   -- örn. "Çevrim içi • Tekler"
  tarih          text not null default '' check (char_length(tarih) <= 80),    -- örn. "12.09.2026 21:00"
  max_katilimci  integer check (max_katilimci is null or max_katilimci > 0),
  durum          text not null default 'taslak' check (durum in ('taslak', 'acik', 'kapali')),
  created_at     timestamptz not null default now()
);

create table if not exists public.basvurular (
  id                uuid primary key default gen_random_uuid(),
  turnuva_id        uuid not null references public.turnuvalar (id) on delete cascade,
  discord_kullanici text not null check (char_length(discord_kullanici) between 2 and 40),
  oyun_profili      text not null check (char_length(oyun_profili) between 3 and 300),
  ad_soyad          text not null default '' check (char_length(ad_soyad) <= 100),   -- opsiyonel
  durum             text not null default 'bekliyor' check (durum in ('bekliyor', 'onaylandi', 'reddedildi')),
  created_at        timestamptz not null default now()
);

-- Aynı turnuvaya aynı Discord adıyla ikinci başvuru engellenir
create unique index if not exists basvuru_tekil
  on public.basvurular (turnuva_id, lower(discord_kullanici));

-- ---------- Kontenjan kontrolü ----------
-- Anonim kullanıcı başvuru sayısını okuyamadığı için kontrol,
-- yetkili (security definer) bir fonksiyonla yapılır.

create or replace function public.kontenjan_var(tid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select t.durum = 'acik'
     and (t.max_katilimci is null
          or (select count(*) from basvurular b where b.turnuva_id = tid) < t.max_katilimci)
  from turnuvalar t
  where t.id = tid
$$;

-- Sitedeki kartlarda "X başvuru" göstermek için (başvuru içeriğini açmadan sadece sayı döner)
create or replace function public.basvuru_sayisi(tid uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer from basvurular b where b.turnuva_id = tid
$$;

-- ---------- Satır bazlı güvenlik (RLS) ----------

alter table public.turnuvalar enable row level security;
alter table public.basvurular enable row level security;

-- Turnuvalar: herkes taslak olmayanları görür
drop policy if exists "herkes yayinlananlari gorur" on public.turnuvalar;
create policy "herkes yayinlananlari gorur"
  on public.turnuvalar for select
  to anon
  using (durum <> 'taslak');

-- Turnuvalar: giriş yapmış adminler her şeyi yapabilir
drop policy if exists "adminler tam yetkili" on public.turnuvalar;
create policy "adminler tam yetkili"
  on public.turnuvalar for all
  to authenticated
  using (true)
  with check (true);

-- Başvurular: herkes SADECE açık ve kontenjanı dolmamış turnuvaya başvuru ekleyebilir
drop policy if exists "acik turnuvaya basvuru" on public.basvurular;
create policy "acik turnuvaya basvuru"
  on public.basvurular for insert
  to anon
  with check (durum = 'bekliyor' and public.kontenjan_var(turnuva_id));

-- Başvurular: sadece giriş yapmış adminler okuyabilir / güncelleyebilir / silebilir
drop policy if exists "adminler basvurulari yonetir" on public.basvurular;
create policy "adminler basvurulari yonetir"
  on public.basvurular for all
  to authenticated
  using (true)
  with check (true);

-- ============================================================
-- ÖNEMLİ — elle yapılacak iki ayar (Dashboard):
-- 1) Authentication > Sign In / Up > "Allow new users to sign up" KAPATIN.
--    Böylece sadece sizin eklediğiniz admin hesapları giriş yapabilir.
-- 2) Authentication > Users > "Add user" ile admin e-posta/şifrelerini ekleyin.
-- ============================================================
