# Monteiro Locações

Site institucional e catálogo da Monteiro Locações. O projeto funciona de forma
independente e não precisa de serviço de backend.

## Requisitos

- Node.js 20 ou mais recente
- npm 10 ou mais recente

## Instalação

Na pasta do projeto, execute:

```bash
npm install
```

## Rodar no computador

```bash
npm run dev
```

Abra no navegador o endereço exibido no terminal, normalmente
`http://localhost:5173`.

## Verificações

```bash
npm run build
npm run lint
npm run typecheck
```

As imagens do catálogo ficam em `public/images`, e os produtos podem ser
alterados em `src/data/products.js`.
