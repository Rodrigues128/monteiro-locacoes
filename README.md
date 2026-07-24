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

## Publicação no Netlify

1. Em **Site configuration > Environment variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os mesmos valores do arquivo `.env`. Use somente a chave **anon public** do Supabase.
2. Faça um novo deploy depois de salvar as variáveis, pois o Vite as aplica durante a compilação.
3. O arquivo `public/_redirects` mantém as rotas do React funcionando no Netlify. Assim, abrir diretamente `/admin` exibe o painel em vez de retornar erro 404.

Mantenha a pasta `supabase` versionada no repositório: ela contém o SQL para criar as tabelas, as políticas de segurança, o bucket de imagens e os dados iniciais. O Netlify não executa esses arquivos; você os executa no SQL Editor do Supabase.

## Segurança

Depois de executar o schema, execute também [`supabase/security-hardening.sql`](./supabase/security-hardening.sql) no SQL Editor. O script reforça RLS, restringe o bucket `catalog` a imagens JPG, PNG ou WEBP de até 5 MB e limita uploads às pastas `products/` e `gallery/`.

- Use somente `VITE_SUPABASE_URL` e a chave **Publishable** (ou **anon public**) no Netlify. Nunca publique `sb_secret`, `service_role` ou uma senha no repositório.
- Em **Authentication > Providers > Email**, mantenha a confirmação de e-mail ativa e habilite CAPTCHA/rate limiting se o projeto receber muitas tentativas de login.
- Crie administradores apenas pelo Supabase Dashboard ou SQL Editor; o painel não oferece cadastro público de usuários.
- Use uma senha única e forte para cada administrador e remova imediatamente usuários que não devem mais ter acesso em `admin_users` e Authentication.

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
