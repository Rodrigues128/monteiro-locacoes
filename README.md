# Monteiro Locações

Site institucional React/Vite com catálogo, galeria, painel administrativo e gestão interna de reservas.

## Requisitos

- Node.js 20+
- Projeto no [Supabase](https://supabase.com/)
- Repositório no GitHub para aplicar migrations automaticamente

## Variáveis de ambiente

Copie `.env.example` para `.env` e informe:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Use apenas a chave Publishable ou anon public no frontend. Nunca versiona `sb_secret`, `service_role`, connection string do banco ou senhas.

## Banco de dados e migrations

As migrations em [`supabase/migrations`](./supabase/migrations) são a fonte de verdade do banco: catálogo, galeria, RLS, Storage, clientes e reservas.

Para um banco vazio, instale a Supabase CLI, vincule o projeto e aplique as migrations:

```bash
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Para um banco que já foi configurado pelo SQL Editor, siga o baseline explicado em [`supabase/README.md`](./supabase/README.md) antes de executar `db push`. Isso evita recriar tabelas e políticas existentes.

O arquivo [`supabase/seed.sql`](./supabase/seed.sql) é opcional e deve ser usado somente uma vez em uma base vazia, depois de enviar as imagens ao bucket `catalog` nos caminhos correspondentes.

## Automação no GitHub

O workflow [`supabase-migrations.yml`](./.github/workflows/supabase-migrations.yml) executa migrations pendentes em cada push para `main` que altere `supabase/migrations/`.

No GitHub, crie o secret `SUPABASE_DB_URL` com a connection string obtida em **Supabase Dashboard > Connect**. Prefira **Direct connection** quando a conexão suportar IPv6; caso contrário, use **Session pooler**, que é a alternativa para redes IPv4. Essa connection string é exclusiva da pipeline e não deve ser colocada em `.env`, no Netlify ou no código frontend.

## Segurança

- RLS restringe operações administrativas aos usuários registrados em `admin_users`.
- O bucket `catalog` aceita apenas JPG, PNG e WEBP de até 5 MB nas pastas permitidas.
- Crie administradores apenas pelo Supabase Dashboard ou SQL; o painel não possui cadastro público.
- Mantenha confirmação de e-mail, CAPTCHA e rate limiting habilitados no Supabase Authentication quando aplicável.

## Agendamentos

No painel, abra **Agendamentos** e siga o fluxo:

1. Cole a mensagem interna em `/admin/agendamentos`.
2. Salve e revise os dados em `/admin/agendamentos/revisar`.
3. Vincule os serviços, informe quantidades e confirme a reserva.
4. Acompanhe ou altere o status em `/admin/reservas`.

A confirmação é transacional no Supabase: o sistema cria ou localiza o cliente e registra a reserva com os itens. Não há integração automática com WhatsApp nesta versão.

## Publicação no Netlify

Em **Site configuration > Environment variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Faça um novo deploy após alterar variáveis. O arquivo `public/_redirects` mantém rotas como `/admin` funcionando diretamente.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Verificações

```bash
npm run lint
npm run typecheck
npm run build
```
