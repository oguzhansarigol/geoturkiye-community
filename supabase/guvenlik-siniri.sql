-- ============================================================
-- Güvenlik tavanları — toplu sahte başvuru (flood) koruması.
-- Mevcut veritabanına uygulanacak yama: SQL Editor'de Run deyin.
-- (kurulum.sql ve kulup-basvurulari.sql'den SONRA çalıştırılır;
--  tekrar çalıştırmak güvenlidir.)
-- ============================================================

-- Turnuva başvurularında mutlak tavan: kontenjan belirtilmemiş
-- (sınırsız) turnuvalarda bile tek turnuvaya en fazla 10000 kayıt.
create or replace function public.kontenjan_var(tid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select t.durum = 'acik'
     and (select count(*) from basvurular b where b.turnuva_id = tid)
         < least(coalesce(t.max_katilimci, 10000), 10000)
  from turnuvalar t
  where t.id = tid
$$;

-- Kulüp başvuruları tablosunun tamamı için mutlak tavan (10000 kayıt).
-- Uydurma kulüp adlarıyla tablo şişirilemesin diye tavan tablo genelidir.
create or replace function public.kulup_tavani_asilmadi()
returns boolean
language sql
security definer
set search_path = public
as $$
  select count(*) < 10000 from kulup_basvurulari
$$;

drop policy if exists "herkes kulup basvurusu yapar" on public.kulup_basvurulari;
create policy "herkes kulup basvurusu yapar"
  on public.kulup_basvurulari for insert
  to anon
  with check (durum = 'bekliyor' and public.kulup_tavani_asilmadi());
