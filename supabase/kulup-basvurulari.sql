-- ============================================================
-- Kulüp başvuruları — kurulum.sql'den SONRA çalıştırın.
-- Supabase Dashboard > SQL Editor'e yapıştırıp Run deyin.
-- ============================================================

create table if not exists public.kulup_basvurulari (
  id                uuid primary key default gen_random_uuid(),
  kulup             text not null check (char_length(kulup) between 2 and 80),
  discord_kullanici text not null check (char_length(discord_kullanici) between 2 and 40),
  oyun_profili      text not null check (char_length(oyun_profili) between 3 and 300),
  ad_soyad          text not null default '' check (char_length(ad_soyad) <= 100),   -- opsiyonel
  durum             text not null default 'bekliyor' check (durum in ('bekliyor', 'onaylandi', 'reddedildi')),
  created_at        timestamptz not null default now()
);

-- Aynı kulübe aynı Discord adıyla ikinci başvuru engellenir
create unique index if not exists kulup_basvuru_tekil
  on public.kulup_basvurulari (kulup, lower(discord_kullanici));

alter table public.kulup_basvurulari enable row level security;

-- Tablo geneli mutlak tavan (toplu sahte başvuru koruması)
create or replace function public.kulup_tavani_asilmadi()
returns boolean
language sql
security definer
set search_path = public
as $$
  select count(*) < 10000 from kulup_basvurulari
$$;

-- Herkes başvuru ekleyebilir (sadece "bekliyor" durumunda ve tavan aşılmadıysa)
drop policy if exists "herkes kulup basvurusu yapar" on public.kulup_basvurulari;
create policy "herkes kulup basvurusu yapar"
  on public.kulup_basvurulari for insert
  to anon
  with check (durum = 'bekliyor' and public.kulup_tavani_asilmadi());

-- Sadece giriş yapmış adminler okuyabilir / güncelleyebilir / silebilir
drop policy if exists "adminler kulup basvurularini yonetir" on public.kulup_basvurulari;
create policy "adminler kulup basvurularini yonetir"
  on public.kulup_basvurulari for all
  to authenticated
  using (true)
  with check (true);
