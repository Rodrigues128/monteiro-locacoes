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

## CRM administrativo

Além do catálogo e da agenda, o painel possui módulos para clientes, orçamentos, financeiro, contratos, recibos, disponibilidade, estatísticas e dados da empresa. Eles usam a migration `20260812000000_crm_operations.sql` e ficam disponíveis depois de executar `npx supabase db push` (ou após a GitHub Action aplicar a migration no ambiente remoto).

- **Brinquedos e catálogo:** produtos publicados no site público.
- **Clientes:** contatos cadastrados ou criados durante a confirmação de uma reserva.
- **Orçamentos e documentos:** propostas com produtos, quantidades, valores e total calculado; contratos e recibos organizados por cliente.
- **Financeiro:** entradas e saídas manuais da operação.
- **Disponibilidade e estatísticas:** agenda operacional, bloqueios internos e indicadores das reservas.

### PDF de orçamento

Ao criar um orçamento, adicione os produtos do catálogo, ajuste quantidades e valores unitários. Depois, use **Gerar PDF** no cartão da proposta. O documento abre em uma nova aba com os dados da empresa, cliente, itens e total; no botão **Salvar / imprimir PDF**, escolha **Salvar como PDF** no diálogo do navegador. Não é necessário serviço externo ou chave secreta para esse fluxo.

## Publicação no Netlify

Em **Site configuration > Environment variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Faça um novo deploy após alterar variáveis. O arquivo `public/_redirects` mantém rotas como `/admin` funcionando diretamente.

## Contingência quando o Supabase estiver indisponível

O catálogo e a galeria públicos usam o Supabase como fonte principal, mas armazenam no navegador a última versão carregada com sucesso. Se a conexão falhar, o site mostra essa versão salva; no primeiro acesso sem conexão, usa imagens e atrações locais de emergência. O visitante recebe um aviso e pode tentar reconectar sem recarregar a página.

O painel administrativo não usa dados de emergência para criar ou alterar informações. Isso evita que uma atualização seja confundida com dados reais enquanto o banco estiver fora do ar.

Se o site entrar em modo de contingência, siga esta ordem:

1. Consulte [status.supabase.com](https://status.supabase.com/).
2. Abra o projeto no Supabase Dashboard e confirme que ele está ativo.
3. Em **Project Settings > API**, confira a `VITE_SUPABASE_URL` e a chave pública configuradas em `.env` e no Netlify.
4. Após qualquer correção nas variáveis do Netlify, faça um novo deploy.

### Backup global automático

O workflow [`.github/workflows/public-catalog-backup.yml`](./.github/workflows/public-catalog-backup.yml) atualiza a cada 30 minutos um arquivo público com os produtos, fotos e cópias locais das imagens. O commit criado pelo workflow aciona o deploy automático do Netlify. Assim, se o Supabase cair, todos os visitantes recebem a última cópia global publicada, mesmo em um navegador que nunca acessou o site antes.

Ative uma única vez no GitHub em **Settings > Secrets and variables > Actions**:

1. Crie o secret `VITE_SUPABASE_URL` com a URL do projeto em **Supabase > Project Settings > API**.
2. Crie o secret `VITE_SUPABASE_ANON_KEY` com a chave Publishable/anon pública do mesmo local.
3. Depois que o Supabase estiver acessível, abra **Actions > Public catalog backup > Run workflow** para criar a primeira cópia imediatamente.

O script também pode ser executado localmente com `npm run backup:public`. Ele preserva o último backup válido quando o Supabase não responde.

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
