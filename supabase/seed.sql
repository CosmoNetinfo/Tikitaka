-- Reset data
delete from company_settings;
delete from closed_days;
delete from order_lines;
delete from orders;
delete from special_items;
delete from extras;
delete from combos;
delete from menu_items;
delete from delivery_slots;
delete from companies;

-- Create company with fixed UUID
insert into companies (id, name, slug, delivery_weekdays, is_active)
values ('11111111-1111-1111-1111-111111111111', 'Tecnokar', 'tecnokar', '{1,2,3,4,5}', true);

-- Company Settings
insert into company_settings (
  company_id, order_cutoff_time, monday_cutoff_on_saturday, cancel_until_time, delivery_point_text,
  card_payments_enabled, cash_payments_enabled, card_fee_mode, card_fee_value,
  issuer_name, issuer_vat, issuer_address, issuer_email, issuer_phone
) values (
  '11111111-1111-1111-1111-111111111111', '14:00', true, '09:00', 'Presso Tecnokar',
  false, true, 'none', 0,
  'Tiki Taka di Laura Simonelli', '04034150542', 'Via dei Vetrai 58, 06049 Spoleto (PG)', 'Laura.simonelli02@yahoo.com', '329 323 9693'
);

-- Delivery slots
insert into delivery_slots (company_id, label, delivery_time, sort_order) values
('11111111-1111-1111-1111-111111111111', 'Primo turno 12:00', '12:00', 1),
('11111111-1111-1111-1111-111111111111', 'Secondo turno 12:30', '12:30', 2),
('11111111-1111-1111-1111-111111111111', 'Terzo turno 13:00', '13:00', 3);

-- Menu items
insert into menu_items (company_id, category, name, price_cents, sort_order) values
-- Primo Formato
('11111111-1111-1111-1111-111111111111', 'primo_formato', 'Linguine', null, 1),
('11111111-1111-1111-1111-111111111111', 'primo_formato', 'Penne', null, 2),
-- Primo Condimento
('11111111-1111-1111-1111-111111111111', 'primo_condimento', 'Pomodoro e basilico', null, 1),
('11111111-1111-1111-1111-111111111111', 'primo_condimento', 'Pesto genovese', null, 2),
('11111111-1111-1111-1111-111111111111', 'primo_condimento', 'Cacio e pepe', null, 3),
-- Secondo
('11111111-1111-1111-1111-111111111111', 'secondo', 'Coscetti di pollo', null, 1),
('11111111-1111-1111-1111-111111111111', 'secondo', 'Polpette al pomodoro', null, 2),
('11111111-1111-1111-1111-111111111111', 'secondo', 'Spezzatino in agrodolce', null, 3),
-- Contorno
('11111111-1111-1111-1111-111111111111', 'contorno', 'Insalata verde', null, 1),
('11111111-1111-1111-1111-111111111111', 'contorno', 'Patate al forno', null, 2),
-- Bibita
('11111111-1111-1111-1111-111111111111', 'bibita', 'Coca-Cola', 200, 1),
('11111111-1111-1111-1111-111111111111', 'bibita', 'Fanta', 200, 2),
('11111111-1111-1111-1111-111111111111', 'bibita', 'Sprite', 200, 3);

-- Combos
insert into combos (company_id, label, has_primo, has_secondo, has_contorno, price_cents) values
('11111111-1111-1111-1111-111111111111', 'Primo + acqua', true, false, false, 600),
('11111111-1111-1111-1111-111111111111', 'Secondo + acqua', false, true, false, 600),
('11111111-1111-1111-1111-111111111111', 'Secondo + contorno + acqua', false, true, true, 800),
('11111111-1111-1111-1111-111111111111', 'Primo + secondo + acqua', true, true, false, 1000),
('11111111-1111-1111-1111-111111111111', 'Primo + secondo + contorno + acqua', true, true, true, 1300);

-- Extras
insert into extras (company_id, name, price_cents) values
('11111111-1111-1111-1111-111111111111', 'Bibita in lattina', 200);
