# Monteiro Locações

Site institucional React/Vite com catálogo, galeria e painel administrativo em `/admin`.

## Requisitos

- Node.js 20+
- Um projeto no [Supabase](https://supabase.com/)

## Configuração do Supabase

1. Crie um projeto no Supabase e abra **Project settings > API**.
2. Copie a URL do projeto e a chave **anon public** para um arquivo `.env`, usando `.env.example` como modelo. Nunca use nem publique a `service_role` no frontend.
3. No **SQL Editor**, execute [`supabase/schema.sql`](./supabase/schema.sql).
4. Em **Authentication > Users**, crie o primeiro usuário administrador com e-mail e senha.
5. Ainda no SQL Editor, execute, substituindo o UUID pelo ID desse usuário:

   ```sql
   insert into public.admin_users (user_id) values ('UUID_DO_USUARIO');
   ```

6. No bucket `catalog`, envie as imagens em `public/images` para os caminhos indicados nos comentários de [`supabase/seed.sql`](./supabase/seed.sql): `products/...` para catálogo e `gallery/...` para a galeria.
7. Execute [`supabase/seed.sql`](./supabase/seed.sql) para importar os produtos e imagens já existentes. Execute-o uma única vez em uma base vazia.

As políticas já deixam itens ativos e imagens públicos para visitantes, e restringem criação, edição, exclusão e upload a usuários presentes em `admin_users`.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite e acesse `/admin` para fazer login. Após entrar, o painel permite cadastrar, editar, ativar/desativar e excluir produtos, enviar/substituir fotos principais e administrar as fotos da galeria.

## Verificações

```bash
npm run lint
npm run typecheck
npm run build
```
