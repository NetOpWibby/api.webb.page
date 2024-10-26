# Set the default recipe to run when just is called without arguments
default:
  @just --list

# Build the project
build:
  deno compile --output dist/app main.ts

# Clean build artifacts
# clean:
#   rm -rf dist

# Run project for local development
dev:
  deno run --allow-env --allow-net --allow-read --allow-run --allow-write main.ts development

# Run project for production
start:
  deno run --allow-env --allow-net --allow-read --allow-run --allow-write main.ts

# Build and update version
release: version build
  @echo "Release built and versioned"

# Generate version.txt
version:
  @echo "Updating version.txt with ChronVer"
  @deno eval "const now = new Date(); const version = \`\${now.getFullYear()}.\${String(now.getMonth() + 1).padStart(2, '0')}.\${String(now.getDate()).padStart(2, '0')}\`; await Deno.writeTextFile('version.txt', version);"
  @echo "Version updated to $(cat version.txt)"
