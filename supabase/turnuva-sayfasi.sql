-- ============================================================
-- GeoGuessrTürkiye — Turnuva sayfası (oyuncu kartları + canlı izleme)
-- Supabase Dashboard > SQL Editor'e yapıştırıp çalıştırın.
-- (turnuva-agaci.sql kurulu olmalıdır.)
-- ============================================================

-- oyuncular : oyuncu adı → GeoGuessr profil linki  → {"DK": "https://www.geoguessr.com/user/…", ...}
--             Adlar torbalardaki adlarla birebir aynı olmalıdır; avatar,
--             ülke ve lig bilgisi bu linkten çekilir.
-- yayin_url : bu turnuvanın canlı yayın linki (YouTube); boşsa site
--             ayarlarındaki kanal linki kullanılır.
-- slug      : sayfa adresi (/turnuva/<slug>); boşsa turnuva id'si kullanılır.
alter table public.turnuva_agaclari
  add column if not exists oyuncular jsonb not null default '{}',
  add column if not exists yayin_url text not null default '' check (char_length(yayin_url) <= 300),
  add column if not exists slug text check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

create unique index if not exists turnuva_agaclari_slug_idx
  on public.turnuva_agaclari (slug) where slug is not null;
-- ============================================================
-- GeoGuessrTürkiye — Turnuva sayfası (oyuncu kartları + canlı izleme)
-- Supabase Dashboard > SQL Editor'e yapıştırıp çalıştırın.
-- (turnuva-agaci.sql kurulu olmalıdır.)
-- ============================================================

-- oyuncular : oyuncu adı → GeoGuessr profil linki  → {"DK": "https://www.geoguessr.com/user/…", ...}
--             Adlar torbalardaki adlarla birebir aynı olmalıdır; avatar,
--             ülke ve lig bilgisi bu linkten çekilir.
-- yayin_url : bu turnuvanın canlı yayın linki (YouTube); boşsa site
--             ayarlarındaki kanal linki kullanılır.
-- slug      : sayfa adresi (/turnuva/<slug>); boşsa turnuva id'si kullanılır.
alter table public.turnuva_agaclari
  add column if not exists oyuncular jsonb not null default '{}',
  add column if not exists yayin_url text not null default '' check (char_length(yayin_url) <= 300),
  add column if not exists slug text check (slug is null or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

create unique index if not exists turnuva_agaclari_slug_idx
  on public.turnuva_agaclari (slug) where slug is not null;
