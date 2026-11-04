COMPOSE := docker compose
RUN := $(COMPOSE) run --rm app

.PHONY: help dev down shell install test check lint format build db-push db-types auth-emails cron

help: ## List targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  %-12s %s\n", $$1, $$2}'

dev: ## Start the dev server with hot reload on http://localhost:5173
	$(COMPOSE) up --build

down: ## Stop the dev containers
	$(COMPOSE) down

shell: ## Open a shell in the running dev container
	$(COMPOSE) exec app bash

install: ## Install dependencies
	$(RUN) pnpm install

test: ## Run unit tests
	$(RUN) pnpm test

check: ## Type-check (svelte-check)
	$(RUN) pnpm check

lint: ## Prettier + ESLint
	$(RUN) pnpm lint

format: ## Format with Prettier
	$(RUN) pnpm format

build: ## Production build
	$(RUN) pnpm build

db-push: ## Apply migrations to the Supabase project in SUPABASE_PROJECT_REF
	$(RUN) sh -c 'pnpm exec supabase link --project-ref "$$SUPABASE_PROJECT_REF" && pnpm exec supabase db push --remote'

db-types: ## Regenerate src/lib/database.types.ts from the Supabase project
	$(RUN) sh -c 'pnpm exec supabase gen types typescript --remote="$$SUPABASE_PROJECT_REF" > src/lib/database.types.ts.tmp \
		&& mv src/lib/database.types.ts.tmp src/lib/database.types.ts \
		|| { rm -f src/lib/database.types.ts.tmp; exit 1; }'

auth-emails: ## Upload the sign-in email templates to the Supabase project in SUPABASE_PROJECT_REF
	$(RUN) node supabase/setup/auth-emails.ts

cron: ## Trigger the reminder job on the running dev server
	$(COMPOSE) exec app node -e "fetch('http://localhost:5173/api/cron/reminders', { headers: { authorization: 'Bearer ' + process.env.CRON_SECRET } }).then(async (r) => console.log(r.status, await r.text()))"
