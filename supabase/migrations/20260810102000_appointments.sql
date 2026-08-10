-- Execute depois de schema.sql e security-hardening.sql no SQL Editor.
-- Esta etapa prepara o processamento manual; ela não cria agendamentos automaticamente.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document_number text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_document_format check (document_number is null or document_number ~ '^(\\d{11}|\\d{14})$')
);
create unique index if not exists customers_document_number_unique on public.customers (document_number) where document_number is not null;

create table if not exists public.appointment_messages (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'manual' check (source in ('manual', 'whatsapp')),
  source_message_id text,
  content_hash text not null,
  original_text text not null,
  status text not null default 'received' check (status in ('received', 'processing', 'pending_review', 'ready_to_confirm', 'confirmed', 'processed', 'error', 'duplicate', 'cancelled')),
  extracted_data jsonb not null default '{}'::jsonb,
  validation_issues jsonb not null default '[]'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists appointment_messages_source_message_unique on public.appointment_messages (source, source_message_id) where source_message_id is not null;
create index if not exists appointment_messages_content_hash_index on public.appointment_messages (content_hash);
create index if not exists appointment_messages_status_index on public.appointment_messages (status, received_at desc);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id),
  message_id uuid unique references public.appointment_messages(id),
  event_date date not null,
  start_time time,
  end_time time,
  address text,
  venue_type text,
  total_amount numeric(10, 2),
  status text not null default 'confirmed' check (status in ('draft', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_amount_non_negative check (total_amount is null or total_amount >= 0),
  constraint appointments_time_order check (end_time is null or start_time is null or end_time > start_time)
);
create index if not exists appointments_event_date_index on public.appointments (event_date);

create table if not exists public.appointment_items (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null default 1 constraint appointment_message_items_quantity_positive check (quantity > 0),
  unit_amount numeric(10, 2),
  original_name text not null,
  created_at timestamptz not null default now(),
  constraint appointment_items_amount_non_negative check (unit_amount is null or unit_amount >= 0)
);

create table if not exists public.product_aliases (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  alias text not null,
  normalized_alias text not null unique,
  created_at timestamptz not null default now(),
  unique (product_id, normalized_alias)
);

create table if not exists public.appointment_message_items (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.appointment_messages(id) on delete cascade,
  original_name text not null,
  normalized_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  product_id uuid references public.products(id),
  match_type text not null default 'unidentified' check (match_type in ('exact', 'normalized', 'alias', 'manual', 'approximate', 'unidentified')),
  confidence numeric(4, 3),
  needs_review boolean not null default true,
  created_at timestamptz not null default now(),
  constraint appointment_message_items_confidence check (confidence is null or (confidence >= 0 and confidence <= 1))
);
alter table public.appointment_message_items
  add column if not exists quantity integer not null default 1;
update public.appointment_message_items set quantity = 1 where quantity is null;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'appointment_message_items_quantity_positive') then
    alter table public.appointment_message_items
      add constraint appointment_message_items_quantity_positive check (quantity > 0);
  end if;
end $$;
alter table public.appointment_message_items drop constraint if exists appointment_message_items_match_type_check;
alter table public.appointment_message_items add constraint appointment_message_items_match_type_check check (match_type in ('exact', 'normalized', 'alias', 'manual', 'approximate', 'unidentified'));
create index if not exists appointment_message_items_message_id_index on public.appointment_message_items (message_id);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers for each row execute function public.set_updated_at();
drop trigger if exists appointment_messages_set_updated_at on public.appointment_messages;
create trigger appointment_messages_set_updated_at before update on public.appointment_messages for each row execute function public.set_updated_at();
drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at before update on public.appointments for each row execute function public.set_updated_at();

alter table public.customers enable row level security;
alter table public.appointment_messages enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_items enable row level security;
alter table public.product_aliases enable row level security;
alter table public.appointment_message_items enable row level security;
alter table public.customers force row level security;
alter table public.appointment_messages force row level security;
alter table public.appointments force row level security;
alter table public.appointment_items force row level security;
alter table public.product_aliases force row level security;
alter table public.appointment_message_items force row level security;

grant select, insert, update, delete on public.customers, public.appointment_messages, public.appointments, public.appointment_items, public.product_aliases, public.appointment_message_items to authenticated;
drop policy if exists "admins manage customers" on public.customers;
drop policy if exists "admins manage appointment messages" on public.appointment_messages;
drop policy if exists "admins manage appointments" on public.appointments;
drop policy if exists "admins manage appointment items" on public.appointment_items;
drop policy if exists "admins manage product aliases" on public.product_aliases;
drop policy if exists "admins manage appointment message items" on public.appointment_message_items;
create policy "admins manage customers" on public.customers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage appointment messages" on public.appointment_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage appointments" on public.appointments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage appointment items" on public.appointment_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage product aliases" on public.product_aliases for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage appointment message items" on public.appointment_message_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.confirm_appointment_message(p_message_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message public.appointment_messages%rowtype;
  v_data jsonb;
  v_customer_id uuid;
  v_customer_matches uuid[];
  v_appointment_id uuid;
  v_name text;
  v_document text;
  v_phone text;
  v_event_date date;
  v_start_time time;
  v_end_time time;
  v_address text;
  v_venue_type text;
  v_total_amount numeric(10, 2);
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Apenas administradores podem confirmar agendamentos.' using errcode = '42501';
  end if;

  select * into v_message
  from public.appointment_messages
  where id = p_message_id
  for update;

  if not found then
    raise exception 'Mensagem de agendamento não encontrada.' using errcode = 'P0002';
  end if;

  if v_message.status = 'confirmed' then
    select id into v_appointment_id from public.appointments where message_id = v_message.id;
    if v_appointment_id is not null then
      return v_appointment_id;
    end if;
    raise exception 'A mensagem já foi confirmada, mas a reserva não foi localizada.';
  end if;

  if v_message.status <> 'ready_to_confirm' then
    raise exception 'Conclua a revisão antes de confirmar o agendamento.';
  end if;

  if exists (
    select 1 from public.appointment_message_items
    where message_id = v_message.id and product_id is null
  ) or not exists (
    select 1 from public.appointment_message_items where message_id = v_message.id
  ) then
    raise exception 'Vincule todos os serviços a produtos antes de confirmar.';
  end if;

  v_data := v_message.extracted_data;
  v_name := nullif(trim(v_data #>> '{client,name}'), '');
  v_document := nullif(regexp_replace(coalesce(v_data #>> '{client,document_number}', ''), '\D', '', 'g'), '');
  v_phone := nullif(regexp_replace(coalesce(v_data #>> '{client,phone}', ''), '\D', '', 'g'), '');
  v_address := nullif(trim(v_data #>> '{event,address}'), '');
  v_venue_type := nullif(trim(v_data #>> '{event,venue_type}'), '');

  if v_name is null or v_address is null then
    raise exception 'Nome do cliente e endereço do evento são obrigatórios.';
  end if;
  if v_document is not null and length(v_document) not in (11, 14) then
    raise exception 'CPF/CNPJ precisa conter 11 ou 14 números.';
  end if;
  if v_phone is not null and length(v_phone) not in (10, 11) then
    raise exception 'Telefone precisa conter 10 ou 11 números.';
  end if;

  begin
    v_event_date := nullif(v_data #>> '{event,date}', '')::date;
    v_start_time := nullif(v_data #>> '{event,start_time}', '')::time;
    v_end_time := nullif(v_data #>> '{event,end_time}', '')::time;
    v_total_amount := nullif(v_data #>> '{total_amount}', '')::numeric(10, 2);
  exception when invalid_text_representation or datetime_field_overflow then
    raise exception 'Data, horário ou valor total inválido.';
  end;

  if v_event_date is null then
    raise exception 'A data do evento é obrigatória.';
  end if;
  if v_end_time is not null and v_start_time is not null and v_end_time <= v_start_time then
    raise exception 'O horário final deve ser posterior ao horário inicial.';
  end if;
  if v_total_amount is not null and v_total_amount < 0 then
    raise exception 'O valor total não pode ser negativo.';
  end if;

  if v_document is not null then
    select id into v_customer_id
    from public.customers
    where document_number = v_document
    limit 1;
  end if;

  if v_customer_id is null and v_phone is not null then
    select array_agg(id) into v_customer_matches
    from public.customers
    where regexp_replace(coalesce(phone, ''), '\D', '', 'g') = v_phone;

    if coalesce(array_length(v_customer_matches, 1), 0) > 1 then
      raise exception 'Há mais de um cliente com este telefone. Revise o CPF/CNPJ antes de confirmar.';
    end if;
    v_customer_id := v_customer_matches[1];
  end if;

  if v_customer_id is null then
    insert into public.customers (name, document_number, phone)
    values (v_name, v_document, v_phone)
    returning id into v_customer_id;
  else
    if v_document is not null and exists (
      select 1 from public.customers
      where id = v_customer_id
        and document_number is not null
        and document_number <> v_document
    ) then
      raise exception 'O CPF/CNPJ informado não corresponde ao cliente encontrado. Revise os dados antes de confirmar.';
    end if;
    update public.customers
    set name = v_name,
        document_number = coalesce(document_number, v_document),
        phone = coalesce(v_phone, phone)
    where id = v_customer_id;
  end if;

  insert into public.appointments (
    customer_id, message_id, event_date, start_time, end_time, address, venue_type, total_amount, status
  ) values (
    v_customer_id, v_message.id, v_event_date, v_start_time, v_end_time, v_address, v_venue_type, v_total_amount, 'confirmed'
  ) returning id into v_appointment_id;

  insert into public.appointment_items (appointment_id, product_id, quantity, original_name)
  select v_appointment_id, product_id, quantity, original_name
  from public.appointment_message_items
  where message_id = v_message.id;

  update public.appointment_messages
  set status = 'confirmed',
      validation_issues = '[]'::jsonb,
      processed_at = now()
  where id = v_message.id;

  return v_appointment_id;
end;
$$;

revoke all on function public.confirm_appointment_message(uuid) from public;
grant execute on function public.confirm_appointment_message(uuid) to authenticated;
