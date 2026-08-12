-- Corrige bancos que possuíam appointment_message_items antes da migration inicial.
-- Mantém os itens existentes e assume quantidade 1 quando a informação não existia.

alter table public.appointment_message_items
  add column if not exists quantity integer not null default 1;

update public.appointment_message_items
set quantity = 1
where quantity is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.appointment_message_items'::regclass
      and conname = 'appointment_message_items_quantity_positive'
  ) then
    alter table public.appointment_message_items
      add constraint appointment_message_items_quantity_positive
      check (quantity > 0);
  end if;
end $$;
