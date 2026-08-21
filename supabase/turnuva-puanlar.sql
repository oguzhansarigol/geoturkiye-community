-- ============================================================
-- GeoGuessrTürkiye — Torba puanları
-- Supabase Dashboard > SQL Editor'e yapıştırıp çalıştırın.
-- (turnuva-agaci.sql kurulu olmalıdır.)
-- ============================================================

-- puanlar : oyuncu adı → puan  → {"DK": 87.5, ...}
--           Admin panelindeki torba tablosunda elle girilir; oyuncular
--           puana göre sıralanıp torbalara otomatik yerleştirilir.
alter table public.turnuva_agaclari
  add column if not exists puanlar jsonb not null default '{}';
