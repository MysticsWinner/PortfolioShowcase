.PHONY: install build test clean

install:
	@echo "Installing dependencies..."
	pnpm install

build:
	@echo "Building packages..."
	pnpm --recursive run build

test:
	@echo "Running tests..."
	pnpm --recursive run test

clean:
	@echo "Cleaning node modules..."
	rm -rf node_modules
	rm -rf apps/**/node_modules
	rm -rf packages/**/node_modules
