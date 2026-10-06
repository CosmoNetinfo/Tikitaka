import re

def update_schema():
    with open(r"Q:\Tikitaka\supabase\schema.sql", "r", encoding="utf-8") as f:
        schema = f.read()
    
    if "create table sites" not in schema:
        sites_table = """
create table sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true
);
"""
        schema = schema.replace("create table company_settings (", sites_table + "\ncreate table company_settings (")
        
    schema = schema.replace(
        "company_id uuid references companies(id),",
        "company_id uuid references companies(id),\n  site_id uuid references sites(id),"
    ) # In delivery_slots it's company_id uuid references companies(id),
    
    # Wait, I need to be more precise for delivery_slots and orders
    if "site_id uuid references sites(id)" not in schema.split("create table delivery_slots")[1].split(";")[0]:
        schema = re.sub(
            r"(create table delivery_slots \([\s\S]*?company_id uuid references companies\(id\),)",
            r"\1\n  site_id uuid references sites(id),",
            schema
        )
    if "site_id uuid" not in schema.split("create table orders")[1].split(";")[0]:
        schema = re.sub(
            r"(create table orders \([\s\S]*?company_id uuid not null references companies\(id\),)",
            r"\1\n  site_id uuid not null references sites(id),\n  site_snapshot text,",
            schema
        )
    
    # RLS for sites
    if "sites enable row level security" not in schema:
        schema += "\nalter table sites enable row level security;"
        schema += "\ncreate policy \"Public can read active sites\" on sites for select using (is_active = true);"
        schema += "\ncreate policy \"Admins full access sites\" on sites to authenticated using (exists (select 1 from admins where user_id = auth.uid()));\n"

    with open(r"Q:\Tikitaka\supabase\schema.sql", "w", encoding="utf-8") as f:
        f.write(schema)

def update_seed():
    with open(r"Q:\Tikitaka\supabase\seed.sql", "r", encoding="utf-8") as f:
        seed = f.read()

    if "insert into sites" not in seed:
        seed_append = """
-- Insert Sites
insert into sites (id, name, is_active) values
  ('11111111-1111-1111-1111-111111111111', 'Tecnokar 1', true),
  ('22222222-2222-2222-2222-222222222222', 'Tecnokar 2', true),
  ('33333333-3333-3333-3333-333333333333', 'Tecnokar 3', true),
  ('44444444-4444-4444-4444-444444444444', 'Tecnokar 4', true);

-- Update delivery_slots with site_id
-- We assume they belong to Tecnokar 1 for now, or create new ones
update delivery_slots set site_id = '11111111-1111-1111-1111-111111111111' where site_id is null;
"""
        seed += "\n" + seed_append

    with open(r"Q:\Tikitaka\supabase\seed.sql", "w", encoding="utf-8") as f:
        f.write(seed)

update_schema()
update_seed()
print("Schema and Seed updated.")
