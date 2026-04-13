# GainLog

Aplicativo PWA de registro e acompanhamento de treinos, corridas e evolucao corporal. Funciona offline com sincronizacao automatica quando a conexao retorna.

## Funcionalidades

- **Dashboard** -- visao geral com metricas, treino do dia e ultimo treino registrado
- **Biblioteca de Treinos** -- cadastro de treinos com exercicios, series e repeticoes
- **Ciclos de Treino** -- planejamento semanal com duracao configuravel
- **Semana** -- visualizacao dia a dia do ciclo ativo
- **Registro de Corridas** -- distancia, pace, elevacao, frequencia cardiaca, superficie e intensidade
- **Evolucao** -- graficos de desempenho por exercicio, recordes pessoais e historico de sessoes
- **Perfil** -- dados corporais, fotos de progresso e galeria de evolucao
- **Modo Offline** -- dados salvos localmente com IndexedDB (Dexie) e sincronizados com Supabase

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS 4 |
| Roteamento | React Router 7 |
| Estado | Zustand |
| Graficos | Recharts |
| Banco local | Dexie (IndexedDB) |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Build | Vite 8 |
| PWA | vite-plugin-pwa |

## Estrutura do projeto

```
src/
  components/
    dashboard/     # Cards de metricas, alerta de ciclo, treino do dia
    evolution/     # Graficos, recordes, historico de sessoes e corridas
    layout/        # AppShell, navbar, sidebar, topbar
    profile/       # Card de perfil, galeria de fotos, modal de edicao
    running/       # Formulario de registro de corrida
    week/          # Seletor de dia, card de exercicio
    workouts/      # Cards de treino, formularios de treino e ciclo
  hooks/           # Hooks customizados (auth, workouts, cycles, etc.)
  lib/             # Supabase client, IndexedDB (Dexie), sincronizacao
  pages/           # Dashboard, Evolution, Login, Profile, Week, Workouts
  stores/          # Zustand stores (auth, cycle)
  types/           # Interfaces TypeScript
supabase/
  migration.sql    # Schema completo com RLS
```

## Configuracao

### Pre-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Clonar e instalar

```bash
git clone https://github.com/filipefalcaofs/app-treino.git
cd app-treino
npm install
```

### 2. Configurar variaveis de ambiente

Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Supabase:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Criar as tabelas no Supabase

Execute o conteudo de `supabase/migration.sql` no SQL Editor do Supabase. Isso cria todas as tabelas, politicas de RLS e o trigger de criacao automatica de perfil.

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

### Outros comandos

| Comando | Descricao |
|---|---|
| `npm run build` | Build de producao |
| `npm run preview` | Preview do build local |
| `npm run lint` | Verificar linting com ESLint |

## Banco de dados

O schema inclui 8 tabelas com Row Level Security (RLS) habilitado em todas:

- `profiles` -- dados do usuario (criado automaticamente no registro)
- `workouts` -- biblioteca de treinos
- `workout_exercises` -- exercicios vinculados a cada treino
- `cycles` -- ciclos de treino com duracao
- `cycle_days` -- configuracao semanal do ciclo
- `training_sessions` -- sessoes de treino registradas
- `training_sets` -- series individuais de cada sessao
- `running_logs` -- registros de corrida
- `progress_photos` -- fotos de evolucao corporal

## Licenca

Projeto privado.
