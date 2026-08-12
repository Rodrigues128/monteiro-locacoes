-- Módulos operacionais do CRM: orçamentos, financeiro, contratos,
-- recibos, disponibilidade e dados da empresa.

create table if not exists public.company_profiles (
  id boolean primary key default true check (id),
  trade_name text not null default 'Monteiro Locações',
  legal_name text,
  document_number text,
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  state text,
  postal_code text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  title text not null,
  event_date date,
  total_amount numeric(10, 2) not null default 0 check (total_amount >= 0),
  status text not null default 'draft' check (status in ('draft', 'sent', 'approved', 'rejected', 'expired')),
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount numeric(10, 2) not null default 0 check (unit_amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.financial_entries (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  description text not null,
  category text,
  entry_type text not null check (entry_type in ('income', 'expense')),
  amount numeric(10, 2) not null check (amount >= 0),
  due_date date,
  paid_at date,
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid unique references public.appointments(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'cancelled')),
  content text not null default '',
  signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  financial_entry_id uuid references public.financial_entries(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  receipt_number text not null unique,
  amount numeric(10, 2) not null check (amount >= 0),
  issued_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  block_type text not null default 'unavailable' check (block_type in ('unavailable', 'maintenance', 'internal')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_blocks_time_order check (end_at > start_at)
);

create index if not exists quotes_status_created_at_index on public.quotes (status, created_at desc);
create index if not exists financial_entries_due_date_index on public.financial_entries (status, due_date);
create index if not exists contracts_status_created_at_index on public.contracts (status, created_at desc);
create index if not exists availability_blocks_period_index on public.availability_blocks (start_at, end_at);

drop trigger if exists company_profiles_set_updated_at on public.company_profiles;
create trigger company_profiles_set_updated_at before update on public.company_profiles for each row execute function public.set_updated_at();
drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at before update on public.quotes for each row execute function public.set_updated_at();
drop trigger if exists financial_entries_set_updated_at on public.financial_entries;
create trigger financial_entries_set_updated_at before update on public.financial_entries for each row execute function public.set_updated_at();
drop trigger if exists contracts_set_updated_at on public.contracts;
create trigger contracts_set_updated_at before update on public.contracts for each row execute function public.set_updated_at();
drop trigger if exists receipts_set_updated_at on public.receipts;
create trigger receipts_set_updated_at before update on public.receipts for each row execute function public.set_updated_at();
drop trigger if exists availability_blocks_set_updated_at on public.availability_blocks;
create trigger availability_blocks_set_updated_at before update on public.availability_blocks for each row execute function public.set_updated_at();

alter table public.company_profiles enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.financial_entries enable row level security;
alter table public.contracts enable row level security;
alter table public.receipts enable row level security;
alter table public.availability_blocks enable row level security;

grant select, insert, update, delete on public.company_profiles, public.quotes, public.quote_items, public.financial_entries, public.contracts, public.receipts, public.availability_blocks to authenticated;

drop policy if exists "admins manage company profiles" on public.company_profiles;
drop policy if exists "admins manage quotes" on public.quotes;
drop policy if exists "admins manage quote items" on public.quote_items;
drop policy if exists "admins manage financial entries" on public.financial_entries;
drop policy if exists "admins manage contracts" on public.contracts;
drop policy if exists "admins manage receipts" on public.receipts;
drop policy if exists "admins manage availability blocks" on public.availability_blocks;

create policy "admins manage company profiles" on public.company_profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage quotes" on public.quotes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage quote items" on public.quote_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage financial entries" on public.financial_entries for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage contracts" on public.contracts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage receipts" on public.receipts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage availability blocks" on public.availability_blocks for all to authenticated using (public.is_admin()) with check (public.is_admin());
