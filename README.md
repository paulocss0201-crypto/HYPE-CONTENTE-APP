# Hype Conteúdo AI

Aplicativo web para criadores de conteúdo, empreendedores e empresas transformarem ideias em conteúdos estratégicos para o Instagram — roteiros de Reels, carrosséis e sequências de Stories — usando Inteligência Artificial.

## Funcionalidades principais

- Geradores de Reels, Carrossel e Stories com IA simulada, acessados pela aba "Criar conteúdo"
- **Organização de Conteúdo**: quadro Kanban (Escrito → Produzido → Postado → Validado) com arrastar e soltar, checklist de produção, histórico de movimentações e análise de resultados por IA
- **Design de Posts**: estúdio de criação visual em canvas (Konva) com templates, biblioteca de elementos/ícones, geração de imagens com IA, Kit de Marca, exportação em PNG/JPG/PDF/ZIP e integração direta com o Kanban

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 (design system preto/branco/cinza)
- React Router para navegação
- Zustand (com persistência em `localStorage`) para autenticação, perfil de marca, projetos, calendário e designs
- Framer Motion para microinterações, `@dnd-kit` para reordenação por arrastar e soltar
- Konva / react-konva para o editor visual (canvas), JSZip para exportação em lote

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
