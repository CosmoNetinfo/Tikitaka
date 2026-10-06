-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create tables
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  delivery_weekdays int[] not null default '{1,2,3,4,5}',
  is_active boolean not null default true
);


create table sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true
);

create table company_settings (
  company_id uuid primary key references companies(id),
  order_cutoff_time time not null default '14:00',
  monday_cutoff_on_saturday boolean not null default true,
  cancel_until_time time not null default '09:00',
  delivery_point_text text default 'Presso Tecnokar',
  card_payments_enabled boolean not null default false,
  cash_payments_enabled boolean not null default true,
  card_fee_mode text not null default 'none' check (card_fee_mode in ('none','fixed','percent')),
  card_fee_value numeric not null default 0,
  receipt_footer text,
  issuer_name text, issuer_vat text, issuer_address text, issuer_email text, issuer_phone text
);

create table delivery_slots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  site_id uuid references sites(id),
  label text not null,
  delivery_time time not null,
  max_orders int,
  sort_order int default 0,
  is_active boolean default true
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  site_id uuid references sites(id),
  category text not null check (category in ('primo_formato','primo_condimento','secondo','contorno','bibita')),
  name text not null,
  image_url text,
  allergens text,
  price_cents int default null,
  sort_order int default 0,
  is_active boolean default true
);

create table combos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  site_id uuid references sites(id),
  label text not null,
  has_primo boolean not null,
  has_secondo boolean not null,
  has_contorno boolean not null,
  price_cents int not null,
  is_active boolean default true
);

create table extras (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  site_id uuid references sites(id),
  name text not null,
  price_cents int not null
);

create table special_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  site_id uuid references sites(id),
  name text not null,
  description text,
  image_url text,
  price_cents int not null,
  includes_water boolean not null default false,
  available_dates date[] not null,
  is_active boolean default true
);

create table closed_days (
  company_id uuid references companies(id),
  site_id uuid references sites(id),
  day date not null,
  reason text,
  primary key (company_id, day)
);

create sequence order_number_seq;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number int not null default nextval('order_number_seq'),
  public_code text unique not null,
  client_token text not null,
  company_id uuid not null references companies(id),
  site_id uuid not null references sites(id),
  site_snapshot text,
  delivery_date date not null,
  slot_id uuid not null references delivery_slots(id),
  customer_first_name text not null,
  customer_last_name text not null,
  notes text,
  combo_id uuid references combos(id),
  primo_formato text, primo_condimento text, secondo text, contorno text,
  drink text,
  subtotal_cents int not null,
  card_fee_cents int not null default 0,
  total_cents int not null,
  payment_method text not null check (payment_method in ('card','cash')),
  payment_status text not null check (payment_status in ('pending_payment','paid','cash_pending','cash_received','unpaid','refunded')),
  status text not null default 'active' check (status in ('active','cancelled')),
  cancelled_at timestamptz,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

create table order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  special_item_id uuid references special_items(id),
  name_snapshot text not null,
  unit_price_cents int not null,
  qty int not null default 1
);

create table admins (
  user_id uuid primary key references auth.users(id)
);

-- RLS setup
alter table companies enable row level security;
alter table company_settings enable row level security;
alter table delivery_slots enable row level security;
alter table menu_items enable row level security;
alter table combos enable row level security;
alter table extras enable row level security;
alter table special_items enable row level security;
alter table closed_days enable row level security;
alter table orders enable row level security;
alter table order_lines enable row level security;
alter table admins enable row level security;

-- Public can read active data
create policy "Public can read active companies" on companies for select using (is_active = true);
create policy "Public can read company settings" on company_settings for select using (true);
create policy "Public can read active menu_items" on menu_items for select using (is_active = true);
create policy "Public can read active combos" on combos for select using (is_active = true);
create policy "Public can read active delivery_slots" on delivery_slots for select using (is_active = true);
create policy "Public can read active special_items" on special_items for select using (is_active = true);
create policy "Public can read closed_days" on closed_days for select using (true);
create policy "Public can read extras" on extras for select using (true);

-- Orders RLS
-- Anyone can insert
create policy "Anon can insert orders" on orders for insert with check (true);
create policy "Anon can insert order_lines" on order_lines for insert with check (true);

-- Select / Update orders only with matching client_token or admin
create policy "Select orders with client_token" on orders for select using (
  client_token = current_setting('request.headers', true)::json->>'x-client-token' 
  or exists (select 1 from admins where user_id = auth.uid())
);
create policy "Select order_lines with client_token" on order_lines for select using (
  exists (select 1 from orders where orders.id = order_lines.order_id and (
    orders.client_token = current_setting('request.headers', true)::json->>'x-client-token'
    or exists (select 1 from admins where user_id = auth.uid())
  ))
);

create policy "Update orders with client_token" on orders for update using (
  client_token = current_setting('request.headers', true)::json->>'x-client-token' 
  or exists (select 1 from admins where user_id = auth.uid())
);

-- Admins full access
create policy "Admins full access companies" on companies to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access company_settings" on company_settings to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access delivery_slots" on delivery_slots to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access menu_items" on menu_items to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access combos" on combos to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access extras" on extras to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access special_items" on special_items to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access closed_days" on closed_days to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access orders" on orders to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access order_lines" on order_lines to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
create policy "Admins full access admins" on admins to authenticated using (exists (select 1 from admins where user_id = auth.uid()));

alter table sites enable row level security;
create policy "Public can read active sites" on sites for select using (is_active = true);
create policy "Admins full access sites" on sites to authenticated using (exists (select 1 from admins where user_id = auth.uid()));
