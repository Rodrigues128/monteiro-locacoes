-- Corrige a expressão de validação de CPF/CNPJ criada no schema inicial.
-- A regra passa a aceitar somente 11 ou 14 dígitos em novos registros e alterações.

alter table public.customers
  drop constraint if exists customers_document_format;

alter table public.customers
  add constraint customers_document_format
  check (document_number is null or document_number ~ '^[0-9]{11}([0-9]{3})?$') not valid;
