-- Atualiza a restrição de bancos que possuíam a lista antiga de tipos de vínculo.

alter table public.appointment_message_items
  drop constraint if exists appointment_message_items_match_type_check;

alter table public.appointment_message_items
  add constraint appointment_message_items_match_type_check
  check (match_type in ('exact', 'normalized', 'alias', 'manual', 'approximate', 'unidentified'));
