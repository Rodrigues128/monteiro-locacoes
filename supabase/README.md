# Supabase migrations

Os arquivos em `migrations/` são a fonte de verdade do schema. Não edite uma migration que já tenha sido aplicada em produção; crie uma nova migration com um timestamp maior.

## Primeiro uso em um banco já existente

O projeto atual foi configurado inicialmente pelo SQL Editor. Antes de ativar a automação, registre como aplicadas somente as migrations que já existem no banco remoto.

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase migration repair --status applied 20260810100000
npx supabase migration repair --status applied 20260810101000
```

Se as tabelas de agendamento já tiverem sido criadas, registre também:

```bash
npx supabase migration repair --status applied 20260810102000
```

Caso as tabelas de agendamento ainda não existam, não execute o último comando. Em seguida, aplique apenas a migration pendente:

```bash
npx supabase db push
```

## GitHub Actions

Defina o secret `SUPABASE_DB_URL` no repositório GitHub com a connection string do banco, obtida em **Supabase Dashboard > Connect**. Prefira **Direct connection** em redes com IPv6; para redes IPv4, use **Session pooler**. A pipeline em `.github/workflows/supabase-migrations.yml` executa `supabase db push` a cada alteração em `main` dentro de `supabase/migrations/`.

Não use a chave Publishable, `sb_secret` ou `service_role` nesse secret. A migration precisa da connection string PostgreSQL com permissões administrativas.
