-- Run this once in Supabase before adding the real catalog.
-- Do not run it after real products are live.
begin;

delete from public.products;
delete from public.categories;

commit;
