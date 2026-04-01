# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at localhost:4200
npm run build      # Production build
npm test           # Run tests with Karma/Jasmine
npm run watch      # Build in watch mode (development)
```

No lint script is configured. Code formatting uses Prettier (100 char line width, single quotes).

## Architecture

**Meu Mercado** is a client-side-only PWA (Progressive Web App) for tracking grocery shopping sessions. It has no backend — all state is persisted in `localStorage`.

### State Management

The app uses **Angular Signals** exclusively (no NgRx/Redux). `CompraService` (`src/app/services/compra.ts`) is the single source of truth:
- `compraAtiva` signal — the current active shopping session (or `null`)
- `historico` signal — array of finalized/cancelled sessions
- Computed signals: `totalCompraAtiva`, `temCompraAtiva`
- An `effect()` auto-persists state to localStorage under the key `mercado_historico`, with version control to handle schema migrations

### Routing

Three routes defined in `app.routes.ts`:
- `/` → `home` page — entry point, navigate to new or active shopping
- `/compra` → `compra-ativa` page — active shopping session (add/remove products)
- `/historico` → `historico` page — read-only history with delete capability

### Key Patterns

- **Standalone components** throughout — no NgModules
- **Reactive Forms** (`FormBuilder`) for product input in `form-produto`
- **Angular Material** for all UI components (dialogs, inputs, buttons, icons)
- **`MatDialog`** used for the confirmation dialog (`dialogo-confirmacao`)
- Product autocomplete merges `alimentos.data.ts` (fixed list) with names from shopping history

### Models

```ts
interface Produto { id: string; nome: string; quantidade: number; valorUnitario: number; }
interface Compra { id: string; mercado: string; dataInicio: Date; dataFim?: Date; produtos: Produto[]; status: 'ativa' | 'finalizada' | 'cancelada'; }
```
