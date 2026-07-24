# Hype Conteúdo AI

Aplicativo web para criadores de conteúdo, empreendedores e empresas transformarem ideias em conteúdos estratégicos para o Instagram — roteiros de Reels, carrosséis e sequências de Stories — usando Inteligência Artificial.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 (design system preto/branco/cinza)
- React Router para navegação
- Zustand (com persistência em `localStorage`) para autenticação, perfil de marca, projetos e calendário
- Framer Motion para microinterações, `@dnd-kit` para reordenação por arrastar e soltar

## Rodando localmente

```bash
npm install
npm run dev
```

## Sobre a geração de conteúdo

A API de Inteligência Artificial ainda não está conectada. Em `src/lib/ai/` há um motor de geração simulado que monta roteiros, carrosséis e Stories realistas a partir do tema, objetivo, público e tom de voz informados — incluindo o perfil estratégico da marca salvo no onboarding. A estrutura foi pensada para que essas funções sejam substituídas por chamadas a um provedor de IA real sem alterar o restante do app.

## Build

```bash
npm run build
```
