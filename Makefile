.PHONY: help build dev test lint

help:
	@echo "Commandes disponibles :"
	@echo "  make dev     				- Run dev server"
	@echo "  make db:generate     - Generate schema files"
	@echo "  make db:migrate      - Apply migration"
	@echo "  make lint    				- Lint the code"
	@echo "  make prod     				- Run prod server"
