-- Payments are off for now: every recipe is free. Each listing's price is kept in
-- pricing.previousPrice (cents) so it can be restored when payments come back:
--   update public.listings
--   set price_cents = (pricing->>'previousPrice')::int, pricing = pricing - 'previousPrice'
--   where pricing ? 'previousPrice';
update public.listings
set pricing = pricing || jsonb_build_object('previousPrice', price_cents),
    price_cents = 0
where price_cents > 0;
